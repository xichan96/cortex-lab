package user

import (
	"context"
	"time"

	"github.com/jinzhu/copier"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/internal/infra/persist"
	"github.com/xichan96/cortex-lab/internal/pkg/errcode"
	"github.com/xichan96/cortex-lab/pkg/web/jwt"
	"golang.org/x/crypto/bcrypt"
)

type AppIer interface {
	CreateUser(ctx context.Context, req *appdto.CreateUserReq) (string, error)
	UpdateUser(ctx context.Context, req *appdto.UpdateUserReq) error
	DeleteUser(ctx context.Context, id string) error
	GetUsers(ctx context.Context) ([]*appdto.User, error)
	GetUser(ctx context.Context, id string) (*appdto.User, error)
	LoginWithPassword(ctx context.Context, req *appdto.LoginRequest) (*appdto.LoginResponse, error)
}

type app struct {
	up persist.UserPersistIer
}

func NewApp(up persist.UserPersistIer) AppIer {
	return &app{up: up}
}

func (a *app) CreateUser(ctx context.Context, req *appdto.CreateUserReq) (string, error) {
	existingUser, err := a.up.GetByUsername(ctx, req.Username)
	if err == nil && existingUser != nil {
		return "", errcode.UsernameExisted
	}
	existingEmail, err := a.up.GetByEmail(ctx, req.Email)
	if err == nil && existingEmail != nil {
		return "", errcode.EmailExisted
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return a.up.Create(ctx, &model.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		AvatarURL:    req.AvatarURL,
	})
}

func (a *app) UpdateUser(ctx context.Context, req *appdto.UpdateUserReq) error {
	user, err := a.up.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}
	if len(req.Password) > 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.PasswordHash = string(hashedPassword)
	}
	if len(req.Username) > 0 {
		user.Username = req.Username
	}
	if len(req.Email) > 0 {
		user.Email = req.Email
	}
	if len(req.AvatarURL) > 0 {
		user.AvatarURL = req.AvatarURL
	}

	user.UpdatedAt = time.Now()
	return a.up.Update(ctx, user)
}

func (a *app) DeleteUser(ctx context.Context, id string) error {
	user, err := a.up.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return a.up.Delete(ctx, user)
}

func (a *app) GetUsers(ctx context.Context) ([]*appdto.User, error) {
	users, err := a.up.GetList(ctx)
	if err != nil {
		return nil, err
	}
	appUsers := make([]*appdto.User, len(users))
	for i, user := range users {
		appUser := &appdto.User{}
		copier.Copy(appUser, user)
		appUsers[i] = appUser
	}
	return appUsers, nil
}

func (a *app) GetUser(ctx context.Context, id string) (*appdto.User, error) {
	user, err := a.up.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	appUser := &appdto.User{}
	copier.Copy(appUser, user)
	return appUser, nil
}

func (a *app) LoginWithPassword(ctx context.Context, req *appdto.LoginRequest) (*appdto.LoginResponse, error) {
	user, err := a.up.GetByUsername(ctx, req.Username)
	if err != nil {
		user, err = a.up.GetByEmail(ctx, req.Username)
		if err != nil {
			return nil, errcode.UserNotFound
		}
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errcode.UserPasswordError
	}

	tokenPayload := map[string]interface{}{
		"id":       user.ID,
		"username": user.Username,
		"role":     user.Role,
	}
	token, err := jwt.DefaultToken.Encode(tokenPayload)
	if err != nil {
		return nil, err
	}

	appUser := &appdto.User{}
	copier.Copy(appUser, user)

	return &appdto.LoginResponse{
		Token: token,
		User:  appUser,
	}, nil
}

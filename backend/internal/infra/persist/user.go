package persist

import (
	"context"

	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/pkg/sql"
	"github.com/xichan96/cortex-lab/pkg/std/snowflake"
	"gorm.io/gorm"
)

type UserPersistIer interface {
	sql.Corm
	Field() *model.UserFieldMeta
	F() *model.UserFieldMeta
	Create(ctx context.Context, user *model.User) (string, error)
	Update(ctx context.Context, user *model.User, options ...func(*gorm.DB) *gorm.DB) error
	GetByID(ctx context.Context, id string) (*model.User, error)
	GetByUsername(ctx context.Context, username string) (*model.User, error)
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.User, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, user *model.User) error
}

func NewUserPersist() UserPersistIer {
	return &UserPersist{
		UserFieldMeta: model.UserFM,
	}
}

type UserPersist struct {
	*model.UserFieldMeta
	sql.BaseOpr
}

func (u *UserPersist) Field() *model.UserFieldMeta { return u.UserFieldMeta }
func (u *UserPersist) F() *model.UserFieldMeta     { return u.UserFieldMeta }

func (u *UserPersist) Create(ctx context.Context, user *model.User) (string, error) {
	if len(user.ID) == 0 {
		user.ID = snowflake.NewUUID()
	}
	if err := u.DB(ctx).Table(u.Table()).Create(&user).Error; err != nil {
		return "", err
	}
	return user.ID, nil
}

func (u *UserPersist) Update(ctx context.Context, user *model.User, options ...func(*gorm.DB) *gorm.DB) error {
	return u.DB(ctx).Table(u.Table()).Scopes(options...).Updates(user).Error
}

func (u *UserPersist) GetByID(ctx context.Context, id string) (*model.User, error) {
	var user model.User
	if err := u.DB(ctx).Table(u.Table()).Where("id = ?", id).Take(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *UserPersist) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	if err := u.DB(ctx).Table(u.Table()).Where("username = ?", username).Take(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *UserPersist) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	if err := u.DB(ctx).Table(u.Table()).Where("email = ?", email).Take(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *UserPersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.User, error) {
	var users []*model.User
	if err := u.DB(ctx).Table(u.Table()).Scopes(options...).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (u *UserPersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := u.DB(ctx).Table(u.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (u *UserPersist) Delete(ctx context.Context, user *model.User) error {
	return u.DB(ctx).Table(u.Table()).Delete(user).Error
}

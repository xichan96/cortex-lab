package appdto

import "time"

type CreateUserReq struct {
	Username  string `json:"username" validate:"required,min=1,max=64"`
	Email     string `json:"email" validate:"required,email,max=128"`
	Password  string `json:"password" validate:"required,min=6,max=128"`
	AvatarURL string `json:"avatar_url" validate:"omitempty,max=255"`
}

type UpdateUserReq struct {
	ID        string `json:"id" validate:"required"`
	Username  string `json:"username" validate:"omitempty,min=1,max=64"`
	Email     string `json:"email" validate:"omitempty,email,max=128"`
	Password  string `json:"password" validate:"omitempty,min=6,max=128"`
	AvatarURL string `json:"avatar_url" validate:"omitempty,max=255"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"` // Can be username or email
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}

type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	AvatarURL string    `json:"avatar_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

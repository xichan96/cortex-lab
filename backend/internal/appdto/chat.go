package appdto

import "time"

type CreateChatSessionReq struct {
	RoleID    string  `json:"role_id" validate:"required"`
	RoleName  string  `json:"role_name" validate:"required"`
	Provider  string  `json:"provider" validate:"required"`
	ModelName string  `json:"model_name" validate:"required"`
	Title     *string `json:"title" validate:"omitempty"`
}

type UpdateChatSessionTitleReq struct {
	ID    string  `json:"id" validate:"required"`
	Title *string `json:"title" validate:"omitempty"`
}

type GetChatSessionsReq struct {
	Page     int `form:"page" json:"page"`
	PageSize int `form:"page_size" json:"page_size"`
}

type ChatSession struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	RoleID    string    `json:"role_id"`
	RoleName  string    `json:"role_name"`
	Provider  string    `json:"provider"`
	ModelName string    `json:"model_name"`
	Title     *string   `json:"title,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type SendChatMessageReq struct {
	Messages []ChatMessageItem `json:"messages" validate:"required,min=1"`
	Tools    []string          `json:"tools,omitempty"`
	Stream   bool              `json:"stream,omitempty"`
}

type ChatMessageItem struct {
	Role    string `json:"role" validate:"required,oneof=user assistant system"`
	Content string `json:"content" validate:"required"`
}

type GetChatMessagesReq struct {
	Page     int    `form:"page" json:"page"`
	PageSize int    `form:"page_size" json:"page_size"`
	Order    string `form:"order" json:"order"`
}

type ChatMessage struct {
	ID        string      `json:"id"`
	SessionID string      `json:"session_id"`
	Role      string      `json:"role"`
	Content   string      `json:"content"`
	Meta      interface{} `json:"meta,omitempty"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

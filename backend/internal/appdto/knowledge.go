package appdto

import "time"

type CreateExperienceReq struct {
	Type     string `json:"type" validate:"required"`
	Title    string `json:"title" validate:"required"`
	Content  string `json:"content" validate:"required"`
	SourceID string `json:"source_id" validate:"omitempty"`
	Tags     string `json:"tags" validate:"omitempty"` // JSON string
	RoleID   string `json:"role_id" validate:"omitempty"`
}

type UpdateExperienceReq struct {
	ID      string `json:"id" validate:"required"`
	Title   string `json:"title" validate:"omitempty"`
	Content string `json:"content" validate:"omitempty"`
	Tags    string `json:"tags" validate:"omitempty"`
}

type GetExperienceReq struct {
	Page     int    `form:"page" json:"page"`
	PageSize int    `form:"page_size" json:"page_size"`
	Type     string `form:"type" json:"type"`
	Keyword  string `form:"keyword" json:"keyword"`
	Q        string `form:"q" json:"q"`
	RoleID   string `form:"role_id" json:"role_id"`
}

type Experience struct {
	ID         string    `json:"id"`
	Type       string    `json:"type"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	SourceID   string    `json:"source_id"`
	Tags       string    `json:"tags"`
	UsageCount int64     `json:"usage_count"`
	CreatedBy  string    `json:"created_by"`
	CreatedAt  time.Time `json:"created_at"`
}

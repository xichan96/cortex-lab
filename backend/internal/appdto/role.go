package appdto

import "time"

type EmailConfig struct {
	Address string `json:"address"`
	Name    string `json:"name"`
	Pwd     string `json:"pwd"`
	Host    string `json:"host"`
	Port    int    `json:"port"`
}

type RoleNotification struct {
	TargetRoleIDs []string `json:"target_role_ids"`
	Trigger       string   `json:"trigger"`
	Content       string   `json:"content"`
}

type HumanNotification struct {
	TargetEmails []string `json:"target_emails"`
	Trigger      string   `json:"trigger"`
	Content      string   `json:"content"`
}

type RoleToolConfig struct {
	Builtin            []string            `json:"builtin,omitempty"`
	MCP                []MCPToolConfig     `json:"mcp,omitempty"`
	EmailConfig        *EmailConfig        `json:"email_config,omitempty"`
	RoleNotifications  []RoleNotification  `json:"role_notifications,omitempty"`
	HumanNotifications []HumanNotification `json:"human_notifications,omitempty"`
}

type MCPToolConfig struct {
	URL   string   `json:"url"`
	Tools []string `json:"tools,omitempty"`
}

type CreateRoleReq struct {
	Name        string          `json:"name" validate:"required,min=1,max=64"`
	Description string          `json:"description" validate:"omitempty,max=255"`
	Avatar      string          `json:"avatar" validate:"omitempty,max=255"`
	Prompt      string          `json:"prompt" validate:"required"`
	Principle   string          `json:"principle" validate:"omitempty"`
	Tools       []string        `json:"tools" validate:"omitempty"`
	ToolConfig  *RoleToolConfig `json:"tool_config" validate:"omitempty"`
	Permissions []string        `json:"permissions" validate:"omitempty"`
	IsPublic    bool            `json:"is_public" validate:"omitempty"`
}

type UpdateRoleReq struct {
	ID          string          `json:"id" validate:"required"`
	Name        string          `json:"name" validate:"omitempty,min=1,max=64"`
	Description string          `json:"description" validate:"omitempty,max=255"`
	Avatar      string          `json:"avatar" validate:"omitempty,max=255"`
	Prompt      string          `json:"prompt" validate:"omitempty"`
	Principle   string          `json:"principle" validate:"omitempty"`
	Tools       []string        `json:"tools" validate:"omitempty"`
	ToolConfig  *RoleToolConfig `json:"tool_config" validate:"omitempty"`
	Permissions []string        `json:"permissions" validate:"omitempty"`
	IsPublic    *bool           `json:"is_public" validate:"omitempty"`
}

type GetRolesReq struct {
	Page     int    `form:"page" json:"page"`
	PageSize int    `form:"page_size" json:"page_size"`
	Keyword  string `form:"keyword" json:"keyword"`
	Scope    string `form:"scope" json:"scope"` // mine, public, all
}

type Role struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Avatar      string          `json:"avatar"`
	Prompt      string          `json:"prompt"`
	Principle   string          `json:"principle,omitempty"`
	Tools       []string        `json:"tools,omitempty"`
	ToolConfig  *RoleToolConfig `json:"tool_config,omitempty"`
	Permissions []string        `json:"permissions,omitempty"`
	CreatorID   string          `json:"creator_id"`
	IsPublic    bool            `json:"is_public"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

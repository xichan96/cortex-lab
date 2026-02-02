package model

import (
	"time"

	"github.com/xichan96/cortex-lab/pkg/sql"
	"gorm.io/gen/field"
)

const TableChatSession = "chat_sessions"

var ChatSessionFM = sql.NewGlobalFieldMetaMapping(ChatSession{}, ChatSessionFieldMeta{})

type ChatSession struct {
	ID        string    `json:"id" gorm:"column:id;type:varchar(36);primaryKey;comment:会话ID (session_id)"`
	UserID    string    `json:"user_id" gorm:"column:user_id;type:varchar(36);not null;index;comment:发起用户ID"`
	RoleID    string    `json:"role_id" gorm:"column:role_id;type:varchar(36);not null;index;comment:绑定的角色ID (不可变)"`
	RoleName  string    `json:"role_name" gorm:"column:role_name;type:varchar(64);not null;comment:角色名称快照"`
	Provider  string    `json:"provider" gorm:"column:provider;type:varchar(64);not null;comment:模型提供商 (不可变)"`
	ModelName string    `json:"model_name" gorm:"column:model_name;type:varchar(128);not null;comment:模型名称 (不可变)"`
	Title     *string   `json:"title" gorm:"column:title;type:varchar(255);comment:会话标题 (模型异步总结)"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoUpdateTime"`
}

func (ChatSession) TableName() string {
	return TableChatSession
}

type ChatSessionFieldMeta struct {
	sql.CTable
	ALL       field.Asterisk
	ID        field.String
	UserID    field.String
	RoleID    field.String
	RoleName  field.String
	Provider  field.String
	ModelName field.String
	Title     field.String
	CreatedAt field.Time
	UpdatedAt field.Time
}

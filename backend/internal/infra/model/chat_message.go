package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/xichan96/cortex-lab/pkg/sql"
	"gorm.io/gen/field"
	"gorm.io/gorm"
)

const TableChatMessage = "chat_messages"

var ChatMessageFM = sql.NewGlobalFieldMetaMapping(ChatMessage{}, ChatMessageFieldMeta{})

type ChatMessage struct {
	ID        string         `json:"id" gorm:"column:id;type:varchar(36);primaryKey;comment:消息ID"`
	SessionID string         `json:"session_id" gorm:"column:session_id;type:varchar(36);not null;index:idx_session_created_at;comment:所属会话ID"`
	Role      string         `json:"role" gorm:"column:role;type:varchar(50);not null;comment:消息角色"`
	Content   string         `json:"content" gorm:"column:content;type:text;not null;comment:消息内容 (Markdown/纯文本)"`
	Meta      *MessageMeta   `json:"meta" gorm:"column:meta;type:text;comment:附加元信息 (如工具调用、token 统计等)"`
	CreatedAt time.Time      `json:"created_at" gorm:"column:created_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoCreateTime;index:idx_session_created_at"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"column:updated_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"column:deleted_at;type:timestamp NULL;index;comment:软删除时间"`
}

func (ChatMessage) TableName() string {
	return TableChatMessage
}

type MessageMeta struct {
	ToolCalls     []interface{} `json:"tool_calls,omitempty"`
	TokenCount    *int          `json:"token_count,omitempty"`
	Error         *string       `json:"error,omitempty"`
	ExperienceIDs []string      `json:"experience_ids,omitempty"`
}

func (m *MessageMeta) Value() (driver.Value, error) {
	if m == nil {
		return nil, nil
	}
	return json.Marshal(m)
}

func (m *MessageMeta) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, m)
}

type ChatMessageFieldMeta struct {
	sql.CTable
	ALL       field.Asterisk
	ID        field.String
	SessionID field.String
	Role      field.String
	Content   field.String
	Meta      field.Field
	CreatedAt field.Time
	UpdatedAt field.Time
	DeletedAt field.Field
}

package model

import (
	"time"

	"github.com/xichan96/cortex-lab/pkg/sql"
	"gorm.io/gen/field"
)

const TableRole = "roles"

var RoleFM = sql.NewGlobalFieldMetaMapping(Role{}, RoleFieldMeta{})

type Role struct {
	ID          string    `json:"id" gorm:"column:id;type:varchar(36);primaryKey;comment:角色ID"`
	Name        string    `json:"name" gorm:"column:name;type:varchar(64);not null;comment:角色名称"`
	Description string    `json:"description" gorm:"column:description;type:varchar(255);default:'';comment:角色描述"`
	Avatar      string    `json:"avatar" gorm:"column:avatar;type:varchar(255);default:'';comment:角色头像emoji"`
	Prompt      string    `json:"prompt" gorm:"column:prompt;type:text;comment:完整角色提示词"`
	Principle   string    `json:"principle" gorm:"column:principle;type:text;comment:核心工作原则（可选）"`
	Tools       string    `json:"tools" gorm:"column:tools;type:json;comment:允许使用的 MCP 工具列表 (JSON Array)"`
	Permissions string    `json:"permissions" gorm:"column:permissions;type:json;comment:权限范围定义 (JSON Array)"`
	CreatorID   string    `json:"creator_id" gorm:"column:creator_id;type:varchar(36);not null;index;comment:创建者ID"`
	IsPublic    int       `json:"is_public" gorm:"column:is_public;type:tinyint(1);not null;default:0;comment:是否公开 (0:私有, 1:公开)"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoCreateTime;comment:创建时间"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoUpdateTime;comment:更新时间"`
}

func (Role) TableName() string {
	return TableRole
}

type RoleFieldMeta struct {
	sql.CTable
	ALL         field.Asterisk
	ID          field.String
	Name        field.String
	Description field.String
	Avatar      field.String
	Prompt      field.String
	Principle   field.String
	Tools       field.String
	Permissions field.String
	CreatorID   field.String
	IsPublic    field.Int
	CreatedAt   field.Time
	UpdatedAt   field.Time
}

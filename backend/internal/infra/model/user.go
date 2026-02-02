package model

import (
	"time"

	"github.com/xichan96/cortex-lab/pkg/sql"
	"gorm.io/gen/field"
	"gorm.io/gorm"
)

const TableUser = "users"

var UserFM = sql.NewGlobalFieldMetaMapping(User{}, UserFieldMeta{})

type User struct {
	ID           string         `json:"id" gorm:"column:id;type:varchar(36);primaryKey;comment:用户ID (UUID)"`
	Username     string         `json:"username" gorm:"column:username;type:varchar(64);not null;unique;comment:用户名"`
	Email        string         `json:"email" gorm:"column:email;type:varchar(128);not null;unique;comment:邮箱"`
	PasswordHash string         `json:"password_hash" gorm:"column:password_hash;type:varchar(128);not null;comment:密码哈希"`
	Role         string         `json:"role" gorm:"column:role;type:varchar(20);not null;default:'user';comment:角色"`
	AvatarURL    string         `json:"avatar_url" gorm:"column:avatar_url;type:varchar(255);comment:头像地址"`
	CreatedAt    time.Time      `json:"created_at" gorm:"column:created_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoCreateTime;comment:创建时间"`
	UpdatedAt    time.Time      `json:"updated_at" gorm:"column:updated_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoUpdateTime;comment:更新时间"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"column:deleted_at;type:timestamp NULL;index;comment:软删除时间"`
}

func (User) TableName() string {
	return TableUser
}

type UserFieldMeta struct {
	sql.CTable
	ALL          field.Asterisk
	ID           field.String
	Username     field.String
	Email        field.String
	PasswordHash field.String
	Role         field.String
	AvatarURL    field.String
	CreatedAt    field.Time
	UpdatedAt    field.Time
	DeletedAt    field.Field
}

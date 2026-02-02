package model

import (
	"time"

	"github.com/xichan96/cortex-lab/pkg/sql"
	"gorm.io/gen/field"
	"gorm.io/gorm"
)

const (
	TableExperience             = "experiences"
	TableRoleExperienceRelation = "role_experience_relations"
)

var (
	ExperienceFM             = sql.NewGlobalFieldMetaMapping(Experience{}, ExperienceFieldMeta{})
	RoleExperienceRelationFM = sql.NewGlobalFieldMetaMapping(RoleExperienceRelation{}, RoleExperienceRelationFieldMeta{})
)

type Experience struct {
	ID         string         `json:"id" gorm:"column:id;type:varchar(36);primaryKey;comment:知识ID"`
	Type       string         `json:"type" gorm:"column:type;type:varchar(32);not null;comment:类型 (snippet, document_fragment, external_link)"`
	Title      string         `json:"title" gorm:"column:title;type:varchar(255);not null;comment:标题;default:''"`
	Content    string         `json:"content" gorm:"column:content;type:text;not null;comment:内容;fulltext:ft_content"`
	Category   string         `json:"category" gorm:"column:category;type:varchar(64);index;comment:自动分类 (Auto-classified by AI)"`
	SourceID   *string        `json:"source_id" gorm:"column:source_id;type:varchar(36);index;comment:来源ID (Chat Session ID 或 Document ID)"`
	Tags       string         `json:"tags" gorm:"column:tags;type:json;comment:标签列表 (JSON Array)"`
	UsageCount int64          `json:"usage_count" gorm:"column:usage_count;type:bigint;not null;default:0;comment:引用/使用次数"`
	CreatedBy  string         `json:"created_by" gorm:"column:created_by;type:varchar(36);not null;comment:创建人ID"`
	CreatedAt  time.Time      `json:"created_at" gorm:"column:created_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoCreateTime"`
	UpdatedAt  time.Time      `json:"updated_at" gorm:"column:updated_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoUpdateTime"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"column:deleted_at;type:timestamp NULL;index;comment:软删除时间"`
}

func (Experience) TableName() string {
	return TableExperience
}

type ExperienceFieldMeta struct {
	sql.CTable
	ALL        field.Asterisk
	ID         field.String
	Type       field.String
	Title      field.String
	Content    field.String
	Category   field.String
	SourceID   field.String
	Tags       field.String
	UsageCount field.Int64
	CreatedBy  field.String
	CreatedAt  field.Time
	UpdatedAt  field.Time
	DeletedAt  field.Field
}

type RoleExperienceRelation struct {
	RoleID       string    `json:"role_id" gorm:"column:role_id;type:varchar(36);primaryKey;comment:角色ID"`
	ExperienceID string    `json:"experience_id" gorm:"column:experience_id;type:varchar(36);primaryKey;index;comment:经验ID"`
	CreatedAt    time.Time `json:"created_at" gorm:"column:created_at;type:timestamp;not null;default:CURRENT_TIMESTAMP;autoCreateTime"`
}

func (RoleExperienceRelation) TableName() string {
	return TableRoleExperienceRelation
}

type RoleExperienceRelationFieldMeta struct {
	sql.CTable
	ALL          field.Asterisk
	RoleID       field.String
	ExperienceID field.String
	CreatedAt    field.Time
}

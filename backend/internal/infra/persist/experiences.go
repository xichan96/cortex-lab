package persist

import (
	"context"

	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/pkg/sql"
	"github.com/xichan96/cortex-lab/pkg/std/snowflake"
	"gorm.io/gorm"
)

type ExperiencePersistIer interface {
	sql.Corm
	Field() *model.ExperienceFieldMeta
	F() *model.ExperienceFieldMeta
	Create(ctx context.Context, k *model.Experience) (string, error)
	Update(ctx context.Context, k *model.Experience, options ...func(*gorm.DB) *gorm.DB) error
	GetByID(ctx context.Context, id string) (*model.Experience, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Experience, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, k *model.Experience) error
}

func NewExperiencePersist() ExperiencePersistIer {
	return &ExperiencePersist{
		ExperienceFieldMeta: model.ExperienceFM,
	}
}

type ExperiencePersist struct {
	*model.ExperienceFieldMeta
	sql.BaseOpr
}

func (k *ExperiencePersist) Field() *model.ExperienceFieldMeta { return k.ExperienceFieldMeta }
func (k *ExperiencePersist) F() *model.ExperienceFieldMeta     { return k.ExperienceFieldMeta }

func (k *ExperiencePersist) Create(ctx context.Context, experience *model.Experience) (string, error) {
	if len(experience.ID) == 0 {
		experience.ID = snowflake.NewUUID()
	}
	if err := k.DB(ctx).Table(k.Table()).Create(&experience).Error; err != nil {
		return "", err
	}
	return experience.ID, nil
}

func (k *ExperiencePersist) Update(ctx context.Context, experience *model.Experience, options ...func(*gorm.DB) *gorm.DB) error {
	return k.DB(ctx).Table(k.Table()).Scopes(options...).Updates(experience).Error
}

func (k *ExperiencePersist) GetByID(ctx context.Context, id string) (*model.Experience, error) {
	var experience model.Experience
	if err := k.DB(ctx).Table(k.Table()).Where("id = ?", id).Take(&experience).Error; err != nil {
		return nil, err
	}
	return &experience, nil
}

func (k *ExperiencePersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Experience, error) {
	var list []*model.Experience
	if err := k.DB(ctx).Table(k.Table()).Scopes(options...).Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (k *ExperiencePersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := k.DB(ctx).Table(k.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (k *ExperiencePersist) Delete(ctx context.Context, experience *model.Experience) error {
	return k.DB(ctx).Table(k.Table()).Delete(experience).Error
}

type RoleExperienceRelationPersistIer interface {
	sql.Corm
	Field() *model.RoleExperienceRelationFieldMeta
	Create(ctx context.Context, rel *model.RoleExperienceRelation) error
	Delete(ctx context.Context, rel *model.RoleExperienceRelation) error
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.RoleExperienceRelation, error)
}

func NewRoleExperienceRelationPersist() RoleExperienceRelationPersistIer {
	return &RoleExperienceRelationPersist{
		RoleExperienceRelationFieldMeta: model.RoleExperienceRelationFM,
	}
}

type RoleExperienceRelationPersist struct {
	*model.RoleExperienceRelationFieldMeta
	sql.BaseOpr
}

func (r *RoleExperienceRelationPersist) Field() *model.RoleExperienceRelationFieldMeta {
	return r.RoleExperienceRelationFieldMeta
}

func (r *RoleExperienceRelationPersist) Create(ctx context.Context, rel *model.RoleExperienceRelation) error {
	return r.DB(ctx).Table(r.Table()).Create(&rel).Error
}

func (r *RoleExperienceRelationPersist) Delete(ctx context.Context, rel *model.RoleExperienceRelation) error {
	return r.DB(ctx).Table(r.Table()).Delete(rel).Error
}

func (r *RoleExperienceRelationPersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.RoleExperienceRelation, error) {
	var list []*model.RoleExperienceRelation
	if err := r.DB(ctx).Table(r.Table()).Scopes(options...).Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

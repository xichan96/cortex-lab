package persist

import (
	"context"

	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/pkg/sql"
	"github.com/xichan96/cortex-lab/pkg/std/snowflake"
	"gorm.io/gorm"
)

type RolePersistIer interface {
	sql.Corm
	Field() *model.RoleFieldMeta
	F() *model.RoleFieldMeta
	Create(ctx context.Context, role *model.Role) (string, error)
	Update(ctx context.Context, role *model.Role, options ...func(*gorm.DB) *gorm.DB) error
	GetByID(ctx context.Context, id string) (*model.Role, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Role, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, role *model.Role) error
}

func NewRolePersist() RolePersistIer {
	return &RolePersist{
		RoleFieldMeta: model.RoleFM,
	}
}

type RolePersist struct {
	*model.RoleFieldMeta
	sql.BaseOpr
}

func (r *RolePersist) Field() *model.RoleFieldMeta { return r.RoleFieldMeta }
func (r *RolePersist) F() *model.RoleFieldMeta     { return r.RoleFieldMeta }

func (r *RolePersist) Create(ctx context.Context, role *model.Role) (string, error) {
	if len(role.ID) == 0 {
		role.ID = snowflake.NewUUID()
	}
	if err := r.DB(ctx).Table(r.Table()).Create(&role).Error; err != nil {
		return "", err
	}
	return role.ID, nil
}

func (r *RolePersist) Update(ctx context.Context, role *model.Role, options ...func(*gorm.DB) *gorm.DB) error {
	return r.DB(ctx).Table(r.Table()).Scopes(options...).Updates(role).Error
}

func (r *RolePersist) GetByID(ctx context.Context, id string) (*model.Role, error) {
	var role model.Role
	if err := r.DB(ctx).Table(r.Table()).Where("id = ?", id).Take(&role).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RolePersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Role, error) {
	var roles []*model.Role
	if err := r.DB(ctx).Table(r.Table()).Scopes(options...).Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}

func (r *RolePersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := r.DB(ctx).Table(r.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *RolePersist) Delete(ctx context.Context, role *model.Role) error {
	return r.DB(ctx).Table(r.Table()).Delete(role).Error
}

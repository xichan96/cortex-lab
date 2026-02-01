package persist

import (
	"context"

	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/pkg/sql"
	"github.com/xichan96/cortex-lab/pkg/std/snowflake"
	"gorm.io/gen/field"
	"gorm.io/gorm"
)

type SettingPersistIer interface {
	sql.Corm

	Field() *model.SettingFieldMeta
	F() *model.SettingFieldMeta

	Create(ctx context.Context, setting *model.Setting) (string, error)
	CreateBatch(ctx context.Context, setting []*model.Setting) error
	Update(ctx context.Context, setting *model.Setting, options ...func(*gorm.DB) *gorm.DB) error
	Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.Setting, error)
	GetByID(ctx context.Context, key string) (*model.Setting, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Setting, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, setting *model.Setting) error
	DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error
}

func NewSettingPersist() SettingPersistIer {
	cp := &SettingPersist{
		SettingFieldMeta: model.SettingFM,
	}
	return cp
}

type SettingPersist struct {
	*model.SettingFieldMeta
	sql.BaseOpr
}

func (s *SettingPersist) Field() *model.SettingFieldMeta {
	return s.SettingFieldMeta
}

func (s *SettingPersist) F() *model.SettingFieldMeta {
	return s.SettingFieldMeta
}

func (s *SettingPersist) Group(group ...field.Expr) func(*gorm.DB) *gorm.DB {
	return s.BaseOpr.Group(group...)
}

func (s *SettingPersist) Create(ctx context.Context, setting *model.Setting) (string, error) {

	if len(setting.Key) == 0 {
		setting.Key = snowflake.NewUUID()
	}

	if err := s.DB(ctx).Table(s.Table()).Create(&setting).Error; err != nil {
		return "", err
	}
	return setting.Key, nil
}

func (s *SettingPersist) CreateBatch(ctx context.Context, settings []*model.Setting) error {

	for _, setting := range settings {
		if len(setting.Key) == 0 {
			setting.Key = snowflake.NewUUID()
		}
	}

	if err := s.DB(ctx).Table(s.Table()).CreateInBatches(&settings, 100).Error; err != nil {
		return err
	}
	return nil
}

func (s *SettingPersist) Update(ctx context.Context, setting *model.Setting, options ...func(*gorm.DB) *gorm.DB) error {
	query := s.DB(ctx).Table(s.Table()).Scopes(options...).Updates(setting)
	if err := query.Error; err != nil {
		return err
	}
	return nil
}

func (s *SettingPersist) Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := s.DB(ctx).Table(s.Table()).Scopes(options...)
	if err := query.Take(data).Error; err != nil {
		return err
	}
	return nil
}

func (s *SettingPersist) Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := s.DB(ctx).Table(s.Table()).Scopes(options...)
	if err := query.Find(data).Error; err != nil {
		return err
	}
	return nil
}

func (s *SettingPersist) GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.Setting, error) {
	var result model.Setting
	query := s.DB(ctx).Table(s.Table()).Scopes(options...)
	if err := query.Take(&result).Error; err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *SettingPersist) GetByID(ctx context.Context, key string) (*model.Setting, error) {
	var result model.Setting
	query := s.DB(ctx).Table(s.Table()).Where("`key` = ?", key)
	if err := query.Take(&result).Error; err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *SettingPersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Setting, error) {
	var result []*model.Setting
	query := s.DB(ctx).Table(s.Table()).Scopes(options...)
	if err := query.Find(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (s *SettingPersist) Count(ctx context.Context, options ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	query := s.DB(ctx).Table(s.Table()).Scopes(options...)
	if err := query.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (s *SettingPersist) Delete(ctx context.Context, setting *model.Setting) error {
	if err := s.DB(ctx).Table(s.Table()).Delete(setting).Error; err != nil {
		return err
	}
	return nil
}

func (s *SettingPersist) DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error {
	if err := s.DB(ctx).Table(s.Table()).Scopes(options...).Delete(&model.Setting{}).Error; err != nil {
		return err
	}
	return nil
}

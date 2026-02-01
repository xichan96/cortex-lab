package persist

import (
	"context"

	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/pkg/sql"
	"github.com/xichan96/cortex-lab/pkg/std/snowflake"
	"gorm.io/gorm"
)

type ChatSessionPersistIer interface {
	sql.Corm
	Field() *model.ChatSessionFieldMeta
	F() *model.ChatSessionFieldMeta
	Create(ctx context.Context, session *model.ChatSession) (string, error)
	Update(ctx context.Context, session *model.ChatSession, options ...func(*gorm.DB) *gorm.DB) error
	GetByID(ctx context.Context, id string) (*model.ChatSession, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.ChatSession, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, session *model.ChatSession) error
}

func NewChatSessionPersist() ChatSessionPersistIer {
	return &ChatSessionPersist{
		ChatSessionFieldMeta: model.ChatSessionFM,
	}
}

type ChatSessionPersist struct {
	*model.ChatSessionFieldMeta
	sql.BaseOpr
}

func (p *ChatSessionPersist) Field() *model.ChatSessionFieldMeta { return p.ChatSessionFieldMeta }
func (p *ChatSessionPersist) F() *model.ChatSessionFieldMeta     { return p.ChatSessionFieldMeta }

func (p *ChatSessionPersist) Create(ctx context.Context, session *model.ChatSession) (string, error) {
	if len(session.ID) == 0 {
		session.ID = snowflake.NewUUID()
	}
	if err := p.DB(ctx).Table(p.Table()).Create(&session).Error; err != nil {
		return "", err
	}
	return session.ID, nil
}

func (p *ChatSessionPersist) Update(ctx context.Context, session *model.ChatSession, options ...func(*gorm.DB) *gorm.DB) error {
	return p.DB(ctx).Table(p.Table()).Scopes(options...).Updates(session).Error
}

func (p *ChatSessionPersist) GetByID(ctx context.Context, id string) (*model.ChatSession, error) {
	var session model.ChatSession
	if err := p.DB(ctx).Table(p.Table()).Where("id = ?", id).Take(&session).Error; err != nil {
		return nil, err
	}
	return &session, nil
}

func (p *ChatSessionPersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.ChatSession, error) {
	var sessions []*model.ChatSession
	if err := p.DB(ctx).Table(p.Table()).Scopes(options...).Find(&sessions).Error; err != nil {
		return nil, err
	}
	return sessions, nil
}

func (p *ChatSessionPersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := p.DB(ctx).Table(p.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (p *ChatSessionPersist) Delete(ctx context.Context, session *model.ChatSession) error {
	return p.DB(ctx).Table(p.Table()).Delete(session).Error
}


package persist

import (
	"context"

	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/pkg/sql"
	"github.com/xichan96/cortex-lab/pkg/std/snowflake"
	"gorm.io/gorm"
)

type ChatMessagePersistIer interface {
	sql.Corm
	Field() *model.ChatMessageFieldMeta
	F() *model.ChatMessageFieldMeta
	Create(ctx context.Context, message *model.ChatMessage) (string, error)
	CreateBatch(ctx context.Context, messages []*model.ChatMessage) error
	GetByID(ctx context.Context, id string) (*model.ChatMessage, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.ChatMessage, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	DeleteBySessionID(ctx context.Context, sessionID string) error
}

func NewChatMessagePersist() ChatMessagePersistIer {
	return &ChatMessagePersist{
		ChatMessageFieldMeta: model.ChatMessageFM,
	}
}

type ChatMessagePersist struct {
	*model.ChatMessageFieldMeta
	sql.BaseOpr
}

func (p *ChatMessagePersist) Field() *model.ChatMessageFieldMeta { return p.ChatMessageFieldMeta }
func (p *ChatMessagePersist) F() *model.ChatMessageFieldMeta     { return p.ChatMessageFieldMeta }

func (p *ChatMessagePersist) Create(ctx context.Context, message *model.ChatMessage) (string, error) {
	if len(message.ID) == 0 {
		message.ID = snowflake.NewUUID()
	}
	if err := p.DB(ctx).Table(p.Table()).Create(&message).Error; err != nil {
		return "", err
	}
	return message.ID, nil
}

func (p *ChatMessagePersist) CreateBatch(ctx context.Context, messages []*model.ChatMessage) error {
	for _, msg := range messages {
		if len(msg.ID) == 0 {
			msg.ID = snowflake.NewUUID()
		}
	}
	if err := p.DB(ctx).Table(p.Table()).Create(&messages).Error; err != nil {
		return err
	}
	return nil
}

func (p *ChatMessagePersist) GetByID(ctx context.Context, id string) (*model.ChatMessage, error) {
	var message model.ChatMessage
	if err := p.DB(ctx).Table(p.Table()).Where("id = ?", id).Take(&message).Error; err != nil {
		return nil, err
	}
	return &message, nil
}

func (p *ChatMessagePersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.ChatMessage, error) {
	var messages []*model.ChatMessage
	if err := p.DB(ctx).Table(p.Table()).Scopes(options...).Find(&messages).Error; err != nil {
		return nil, err
	}
	return messages, nil
}

func (p *ChatMessagePersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := p.DB(ctx).Table(p.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (p *ChatMessagePersist) DeleteBySessionID(ctx context.Context, sessionID string) error {
	return p.DB(ctx).Table(p.Table()).Where("session_id = ?", sessionID).Delete(&model.ChatMessage{}).Error
}

package chat

import (
	"context"
	"log/slog"
	"sync"

	"github.com/xichan96/cortex-lab/internal/config"
	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/internal/infra/persist"
	"github.com/xichan96/cortex/agent/types"
	"gorm.io/gorm"
)

type DatabaseMemoryProvider struct {
	mp         persist.ChatMessagePersistIer
	sessionID  string
	maxHistory int
	mu         sync.RWMutex
}

func NewDatabaseMemoryProvider(mp persist.ChatMessagePersistIer, sessionID string, maxHistory int) types.MemoryProvider {
	if maxHistory <= 0 {
		maxHistory = 100
	}
	return &DatabaseMemoryProvider{
		mp:         mp,
		sessionID:  sessionID,
		maxHistory: maxHistory,
	}
}

func (p *DatabaseMemoryProvider) initTable(ctx context.Context) error {
	if config.Var.DB == nil {
		return nil
	}
	doc := model.ChatMessage{}
	return config.Var.DB.WithContext(ctx).Table(model.TableChatMessage).AutoMigrate(&doc)
}

// LoadMemoryVariables loads memory variables (implements MemoryProvider interface)
func (p *DatabaseMemoryProvider) LoadMemoryVariables() (map[string]interface{}, error) {
	messages, err := p.GetChatHistory()
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"history": messages,
	}, nil
}

// SaveContext saves context (implements MemoryProvider interface)
func (p *DatabaseMemoryProvider) SaveContext(input, output map[string]interface{}) error {
	ctx := context.Background()
	if err := p.initTable(ctx); err != nil {
		slog.Error("Failed to init table", "error", err)
		return err
	}
	if inputMsg, ok := input["input"].(string); ok {
		msg := &model.ChatMessage{
			SessionID: p.sessionID,
			Role:      "user",
			Content:   inputMsg,
		}
		if _, err := p.mp.Create(ctx, msg); err != nil {
			slog.Error("Failed to save user message", "error", err, "session_id", p.sessionID)
			return err
		}
	}
	if outputMsg, ok := output["output"].(string); ok {
		msg := &model.ChatMessage{
			SessionID: p.sessionID,
			Role:      "assistant",
			Content:   outputMsg,
		}
		if _, err := p.mp.Create(ctx, msg); err != nil {
			slog.Error("Failed to save assistant message", "error", err, "session_id", p.sessionID)
			return err
		}
	}
	return nil
}

// Clear clears memory (implements MemoryProvider interface)
func (p *DatabaseMemoryProvider) Clear() error {
	ctx := context.Background()
	if err := p.mp.DeleteBySessionID(ctx, p.sessionID); err != nil {
		slog.Error("Failed to clear memory", "error", err, "session_id", p.sessionID)
		return err
	}
	return nil
}

// GetChatHistory gets chat history (implements MemoryProvider interface)
func (p *DatabaseMemoryProvider) GetChatHistory() ([]types.Message, error) {
	ctx := context.Background()
	if err := p.initTable(ctx); err != nil {
		slog.Error("Failed to init table", "error", err)
		return nil, err
	}

	p.mu.RLock()
	maxHistory := p.maxHistory
	sessionID := p.sessionID
	p.mu.RUnlock()

	opts := []func(*gorm.DB) *gorm.DB{
		func(db *gorm.DB) *gorm.DB {
			return db.Where("session_id = ?", sessionID)
		},
		func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		},
	}

	if maxHistory > 0 {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			return db.Limit(maxHistory)
		})
	}

	messages, err := p.mp.GetList(ctx, opts...)
	if err != nil {
		slog.Error("Failed to get chat history", "error", err, "session_id", sessionID)
		return nil, err
	}

	result := make([]types.Message, len(messages))
	for i, m := range messages {
		result[i] = types.Message{
			Role:    m.Role,
			Content: m.Content,
		}
	}

	return result, nil
}

// CompressMemory compresses memory (implements MemoryProvider interface)
func (p *DatabaseMemoryProvider) CompressMemory(llm types.LLMProvider, maxMessages int) error {
	// Memory compression is not implemented for database provider
	// The database already handles history limits through queries
	return nil
}

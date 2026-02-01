package agent

import (
	"context"
	"log/slog"

	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex/agent/providers"
	"github.com/xichan96/cortex/agent/types"
	"github.com/xichan96/cortex/pkg/mongodb"
	"github.com/xichan96/cortex/pkg/redis"
)

func (a *app) setupMemory(sessionID string) types.MemoryProvider {
	memorySetting, err := a.settingSrv.GetMemorySetting(context.Background())
	if err != nil {
		slog.Error("failed to get memory setting, fallback to simple memory", "error", err)
		return providers.NewSimpleMemoryProviderWithLimit(100)
	}

	if memorySetting == nil || memorySetting.MemoryConfig == nil {
		return providers.NewSimpleMemoryProviderWithLimit(100)
	}

	memCfg := memorySetting.MemoryConfig
	maxHistory := 100

	switch memCfg.Provider {
	case "redis":
		if memCfg.Redis.MaxHistoryMessages > 0 {
			maxHistory = memCfg.Redis.MaxHistoryMessages
		}
		return a.initRedisMemory(sessionID, maxHistory, &memCfg.Redis)
	case "mongodb":
		if memCfg.MongoDB.MaxHistoryMessages > 0 {
			maxHistory = memCfg.MongoDB.MaxHistoryMessages
		}
		return a.initMongoDBMemory(sessionID, maxHistory, &memCfg.MongoDB)
	case "simple", "langchain", "":
		if memCfg.Simple.MaxHistoryMessages > 0 {
			maxHistory = memCfg.Simple.MaxHistoryMessages
		}
		return providers.NewSimpleMemoryProviderWithLimit(maxHistory)
	default:
		if memCfg.Simple.MaxHistoryMessages > 0 {
			maxHistory = memCfg.Simple.MaxHistoryMessages
		}
		return providers.NewSimpleMemoryProviderWithLimit(maxHistory)
	}
}

func (a *app) initRedisMemory(sessionID string, maxHistory int, cfg *appdto.RedisMemoryConfig) types.MemoryProvider {
	redisCfg := &redis.Config{
		Host:     cfg.Host,
		Port:     cfg.Port,
		Username: cfg.Username,
		Password: cfg.Password,
		DB:       cfg.DB,
	}

	client, err := redis.NewClient(redisCfg)
	if err != nil {
		slog.Error("initRedisMemory failed", "error", err,
			"fallback", "simple_memory",
			"session_id", sessionID)
		return providers.NewSimpleMemoryProviderWithLimit(maxHistory)
	}

	provider := providers.NewRedisMemoryProviderWithLimit(client, sessionID, maxHistory)
	if cfg.KeyPrefix != "" {
		provider.SetKeyPrefix(cfg.KeyPrefix)
	}
	return provider
}

func (a *app) initMongoDBMemory(sessionID string, maxHistory int, cfg *appdto.MongoDBMemoryConfig) types.MemoryProvider {
	opts := []mongodb.ClientOptionFunc{
		mongodb.SetURI(cfg.URI),
		mongodb.SetDatabase(cfg.Database),
	}

	client, err := mongodb.NewClient(opts...)
	if err != nil {
		slog.Error("initMongoDBMemory failed", "error", err,
			"fallback", "simple_memory",
			"session_id", sessionID)
		return providers.NewSimpleMemoryProviderWithLimit(maxHistory)
	}

	provider := providers.NewMongoDBMemoryProviderWithLimit(client, sessionID, maxHistory)
	if cfg.Collection != "" {
		provider.SetCollectionName(cfg.Collection)
	}
	return provider
}

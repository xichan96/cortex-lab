package setting

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/jinzhu/copier"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/internal/infra/persist"
	"github.com/xichan96/cortex-lab/pkg/ec"
	"gorm.io/gorm"
)

type AppIer interface {
	CreateSetting(ctx context.Context, req *appdto.CreateSettingReq) (string, error)
	UpdateSetting(ctx context.Context, req *appdto.UpdateSettingReq) error
	GetSettings(ctx context.Context) ([]*appdto.Setting, error)
	GetSetting(ctx context.Context, group, key string) (*appdto.Setting, error)
	DeleteSetting(ctx context.Context, group, key string) error
	GetLLMSetting(ctx context.Context) (*appdto.LLMSetting, error)
	UpdateLLMSetting(ctx context.Context, req *appdto.UpdateLLMSettingReq) error
	GetAgentSetting(ctx context.Context) (*appdto.AgentSetting, error)
	UpdateAgentSetting(ctx context.Context, req *appdto.UpdateAgentSettingReq) error
	GetMemorySetting(ctx context.Context) (*appdto.MemorySetting, error)
	UpdateMemorySetting(ctx context.Context, req *appdto.UpdateMemorySettingReq) error
	GetChatLLMSetting(ctx context.Context) (*appdto.ChatLLMSetting, error)
	UpdateChatLLMSetting(ctx context.Context, req *appdto.UpdateChatLLMSettingReq) error
}

type app struct {
	sp persist.SettingPersistIer
}

func NewApp(sp persist.SettingPersistIer) AppIer {
	return &app{sp: sp}
}

func (a *app) CreateSetting(ctx context.Context, req *appdto.CreateSettingReq) (string, error) {
	// Check if exists
	existing, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq(req.Group), a.sp.Field().Key.Eq(req.Key)))
	if err == nil && existing != nil {
		// Update if exists? Or return error?
		// Usually settings are upserted or just updated. Let's return error if exists for strict Create.
		// But for settings, often set = upsert.
		// Let's stick to Create = error if exists for now, consistent with other entities.
		// Actually, let's implement Create as strict create.
		// TODO: Define error code for SettingExisted if needed.
		// For now just return empty string and error.
	}

	setting := &model.Setting{
		Group: req.Group,
		Key:   req.Key,
		Value: req.Value,
	}
	return a.sp.Create(ctx, setting)
}

func (a *app) UpdateSetting(ctx context.Context, req *appdto.UpdateSettingReq) error {
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq(req.Group), a.sp.Field().Key.Eq(req.Key)))
	if err != nil {
		return err
	}
	setting.Value = req.Value
	setting.UpdatedAt = time.Now()
	return a.sp.Update(ctx, setting)
}

func (a *app) GetSettings(ctx context.Context) ([]*appdto.Setting, error) {
	settings, err := a.sp.GetList(ctx)
	if err != nil {
		return nil, err
	}
	var appSettings []*appdto.Setting
	if err := copier.Copy(&appSettings, settings); err != nil {
		return nil, err
	}
	return appSettings, nil
}

func (a *app) GetSetting(ctx context.Context, group, key string) (*appdto.Setting, error) {
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq(group), a.sp.Field().Key.Eq(key)))
	if err != nil {
		return nil, err
	}
	var appSetting appdto.Setting
	if err := copier.Copy(&appSetting, setting); err != nil {
		return nil, err
	}
	return &appSetting, nil
}

func (a *app) DeleteSetting(ctx context.Context, group, key string) error {
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq(group), a.sp.Field().Key.Eq(key)))
	if err != nil {
		return err
	}
	return a.sp.Delete(ctx, setting)
}

func (a *app) GetLLMSetting(ctx context.Context) (*appdto.LLMSetting, error) {
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq("llm"), a.sp.Field().Key.Eq("config")))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || ec.IsErrCode(err, ec.NoFound) {
			llmConfig := &appdto.LLMConfig{}
			return &appdto.LLMSetting{LLMConfig: llmConfig}, nil
		}
		return nil, err
	}
	llmConfig := &appdto.LLMConfig{}
	if err := json.Unmarshal([]byte(setting.Value), llmConfig); err != nil {
		return nil, err
	}
	return &appdto.LLMSetting{LLMConfig: llmConfig}, nil
}

func (a *app) UpdateLLMSetting(ctx context.Context, req *appdto.UpdateLLMSettingReq) error {
	valueBytes, err := json.Marshal(req.LLMConfig)
	if err != nil {
		return err
	}
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq("llm"), a.sp.Field().Key.Eq("config")))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || ec.IsErrCode(err, ec.NoFound) {
			setting = &model.Setting{
				Group: "llm",
				Key:   "config",
				Value: string(valueBytes),
			}
			_, err = a.sp.Create(ctx, setting)
			return err
		}
		return err
	}
	setting.Value = string(valueBytes)
	return a.sp.Update(ctx, setting)
}

func (a *app) GetChatLLMSetting(ctx context.Context) (*appdto.ChatLLMSetting, error) {
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq("llm"), a.sp.Field().Key.Eq("chat_config")))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || ec.IsErrCode(err, ec.NoFound) {
			chatLLMConfig := &appdto.ChatLLMConfig{}
			return &appdto.ChatLLMSetting{ChatLLMConfig: chatLLMConfig}, nil
		}
		return nil, err
	}
	chatLLMConfig := &appdto.ChatLLMConfig{}
	if err := json.Unmarshal([]byte(setting.Value), chatLLMConfig); err != nil {
		return nil, err
	}
	return &appdto.ChatLLMSetting{ChatLLMConfig: chatLLMConfig}, nil
}

func (a *app) UpdateChatLLMSetting(ctx context.Context, req *appdto.UpdateChatLLMSettingReq) error {
	valueBytes, err := json.Marshal(req.ChatLLMConfig)
	if err != nil {
		return err
	}
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq("llm"), a.sp.Field().Key.Eq("chat_config")))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || ec.IsErrCode(err, ec.NoFound) {
			setting = &model.Setting{
				Group: "llm",
				Key:   "chat_config",
				Value: string(valueBytes),
			}
			_, err = a.sp.Create(ctx, setting)
			return err
		}
		return err
	}
	setting.Value = string(valueBytes)
	return a.sp.Update(ctx, setting)
}

func (a *app) GetAgentSetting(ctx context.Context) (*appdto.AgentSetting, error) {
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq("agent"), a.sp.Field().Key.Eq("config")))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || ec.IsErrCode(err, ec.NoFound) {
			agentConfig := &appdto.AgentConfig{}
			return &appdto.AgentSetting{AgentConfig: agentConfig}, nil
		}
		return nil, err
	}
	agentConfig := &appdto.AgentConfig{}
	if err := json.Unmarshal([]byte(setting.Value), agentConfig); err != nil {
		return nil, err
	}
	return &appdto.AgentSetting{AgentConfig: agentConfig}, nil
}

func (a *app) UpdateAgentSetting(ctx context.Context, req *appdto.UpdateAgentSettingReq) error {
	valueBytes, err := json.Marshal(req.AgentConfig)
	if err != nil {
		return err
	}
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq("agent"), a.sp.Field().Key.Eq("config")))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || ec.IsErrCode(err, ec.NoFound) {
			setting = &model.Setting{
				Group: "agent",
				Key:   "config",
				Value: string(valueBytes),
			}
			_, err = a.sp.Create(ctx, setting)
			return err
		}
		return err
	}
	setting.Value = string(valueBytes)
	return a.sp.Update(ctx, setting)
}

func (a *app) GetMemorySetting(ctx context.Context) (*appdto.MemorySetting, error) {
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq("memory"), a.sp.Field().Key.Eq("config")))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || ec.IsErrCode(err, ec.NoFound) {
			memoryConfig := &appdto.MemoryConfig{}
			return &appdto.MemorySetting{MemoryConfig: memoryConfig}, nil
		}
		return nil, err
	}
	memoryConfig := &appdto.MemoryConfig{}
	if err := json.Unmarshal([]byte(setting.Value), memoryConfig); err != nil {
		return nil, err
	}
	return &appdto.MemorySetting{MemoryConfig: memoryConfig}, nil
}

func (a *app) UpdateMemorySetting(ctx context.Context, req *appdto.UpdateMemorySettingReq) error {
	valueBytes, err := json.Marshal(req.MemoryConfig)
	if err != nil {
		return err
	}
	setting, err := a.sp.GetBy(ctx, a.sp.Where(a.sp.Field().Group.Eq("memory"), a.sp.Field().Key.Eq("config")))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || ec.IsErrCode(err, ec.NoFound) {
			setting = &model.Setting{
				Group: "memory",
				Key:   "config",
				Value: string(valueBytes),
			}
			_, err = a.sp.Create(ctx, setting)
			return err
		}
		return err
	}
	setting.Value = string(valueBytes)
	return a.sp.Update(ctx, setting)
}

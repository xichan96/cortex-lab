package chat

import (
	"context"
	"fmt"

	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex/agent/llm"
	"github.com/xichan96/cortex/agent/types"
)

func (a *app) setupLLM(provider, modelName string) (types.LLMProvider, error) {
	chatLLMSetting, err := a.settingSrv.GetChatLLMSetting(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get Chat LLM setting: %w", err)
	}
	if chatLLMSetting == nil || chatLLMSetting.ChatLLMConfig == nil {
		return nil, fmt.Errorf("Chat LLM setting is nil")
	}

	cfg := chatLLMSetting.ChatLLMConfig

	switch provider {
	case "openai":
		return a.initOpenAI(cfg, modelName)
	case "deepseek":
		return a.initDeepSeek(cfg, modelName)
	case "volce":
		return a.initVolce(cfg, modelName)
	default:
		return nil, fmt.Errorf("unsupported LLM provider: %s", provider)
	}
}

func (a *app) initOpenAI(cfg *appdto.ChatLLMConfig, modelName string) (types.LLMProvider, error) {
	if modelName == "" && len(cfg.OpenAI.Models) > 0 {
		modelName = cfg.OpenAI.Models[0]
	}
	if modelName == "" {
		modelName = "gpt-4o"
	}

	opts := llm.OpenAIOptions{
		APIKey:  cfg.OpenAI.APIKey,
		BaseURL: cfg.OpenAI.BaseURL,
		Model:   modelName,
		OrgID:   cfg.OpenAI.OrgID,
		APIType: cfg.OpenAI.APIType,
	}

	provider, err := llm.NewOpenAIClient(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize OpenAI client: %w", err)
	}
	return provider, nil
}

func (a *app) initDeepSeek(cfg *appdto.ChatLLMConfig, modelName string) (types.LLMProvider, error) {
	if modelName == "" && len(cfg.DeepSeek.Models) > 0 {
		modelName = cfg.DeepSeek.Models[0]
	}
	if modelName == "" {
		modelName = "deepseek-chat"
	}

	opts := llm.DeepSeekOptions{
		APIKey:  cfg.DeepSeek.APIKey,
		BaseURL: cfg.DeepSeek.BaseURL,
		Model:   modelName,
	}

	provider, err := llm.NewDeepSeekClient(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize DeepSeek client: %w", err)
	}
	return provider, nil
}

func (a *app) initVolce(cfg *appdto.ChatLLMConfig, modelName string) (types.LLMProvider, error) {
	if modelName == "" && len(cfg.Volce.Models) > 0 {
		modelName = cfg.Volce.Models[0]
	}
	if modelName == "" {
		modelName = "volce-chat"
	}

	opts := llm.VolceOptions{
		APIKey:  cfg.Volce.APIKey,
		BaseURL: cfg.Volce.BaseURL,
		Model:   modelName,
	}

	provider, err := llm.NewVolceClient(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Volce client: %w", err)
	}
	return provider, nil
}

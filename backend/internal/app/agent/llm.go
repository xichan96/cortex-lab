package agent

import (
	"fmt"

	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex/agent/llm"
	"github.com/xichan96/cortex/agent/types"
)

func (a *app) setupLLM(llmCfg *appdto.LLMConfig) (types.LLMProvider, error) {
	switch llmCfg.Provider {
	case "openai":
		return a.initOpenAI(llmCfg)
	case "deepseek":
		return a.initDeepSeek(llmCfg)
	case "volce":
		return a.initVolce(llmCfg)
	default:
		return nil, fmt.Errorf("unsupported LLM provider: %s", llmCfg.Provider)
	}
}

func (a *app) initOpenAI(cfg *appdto.LLMConfig) (types.LLMProvider, error) {
	opts := llm.OpenAIOptions{
		APIKey:  cfg.OpenAI.APIKey,
		BaseURL: cfg.OpenAI.BaseURL,
		Model:   cfg.OpenAI.Model,
		OrgID:   cfg.OpenAI.OrgID,
		APIType: cfg.OpenAI.APIType,
	}

	provider, err := llm.NewOpenAIClient(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize OpenAI client: %w", err)
	}
	return provider, nil
}

func (a *app) initDeepSeek(cfg *appdto.LLMConfig) (types.LLMProvider, error) {
	opts := llm.DeepSeekOptions{
		APIKey:  cfg.DeepSeek.APIKey,
		BaseURL: cfg.DeepSeek.BaseURL,
		Model:   cfg.DeepSeek.Model,
	}

	provider, err := llm.NewDeepSeekClient(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize DeepSeek client: %w", err)
	}
	return provider, nil
}

func (a *app) initVolce(cfg *appdto.LLMConfig) (types.LLMProvider, error) {
	opts := llm.VolceOptions{
		APIKey:  cfg.Volce.APIKey,
		BaseURL: cfg.Volce.BaseURL,
		Model:   cfg.Volce.Model,
	}

	provider, err := llm.NewVolceClient(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Volce client: %w", err)
	}
	return provider, nil
}

package agent

import (
	"context"
	_ "embed"
	"fmt"
	"log/slog"
	"time"

	"github.com/xichan96/cortex-lab/internal/app/setting"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex/agent/engine"
	"github.com/xichan96/cortex/agent/tools/builtin"
	"github.com/xichan96/cortex/agent/types"
	"github.com/xichan96/cortex/pkg/email"
	"github.com/xichan96/cortex/pkg/mcp"
)

//go:embed prompts/role_assistant.txt
var roleAssistantPrompt string

type AppIer interface {
	Engine(sessionID string, promptContent string, promptConfig string, promptKey string, toolConfig *appdto.RoleToolConfig) (*engine.AgentEngine, error)
	GetRoleAssistantPrompt() string
}

type app struct {
	settingSrv setting.AppIer
}

func NewApp(settingSrv setting.AppIer) AppIer {
	return &app{
		settingSrv: settingSrv,
	}
}

func (a *app) GetRoleAssistantPrompt() string {
	return roleAssistantPrompt
}

func (a *app) build(sessionID string, promptContent string, promptConfigStr string, promptKey string, toolConfig *appdto.RoleToolConfig) (*engine.AgentEngine, error) {
	ctx := context.Background()

	agentSetting, err := a.settingSrv.GetAgentSetting(ctx)
	if err != nil {
		agentSetting = &appdto.AgentSetting{AgentConfig: &appdto.AgentConfig{}}
	}

	llmSetting, err := a.settingSrv.GetLLMSetting(ctx)
	if err != nil || llmSetting == nil || llmSetting.LLMConfig == nil {
		return nil, fmt.Errorf("failed to get LLM setting: %w", err)
	}

	llmProvider, err := a.setupLLM(llmSetting.LLMConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to setup LLM: %w", err)
	}

	memoryProvider := a.setupMemory(sessionID)
	agentConfig := a.setupAgentConfig(promptContent, promptKey, agentSetting)

	engine := engine.NewAgentEngine(llmProvider, agentConfig)
	engine.SetMemory(memoryProvider)

	if tools := a.setupTools(toolConfig); len(tools) > 0 {
		engine.AddTools(tools)
	}

	return engine, nil
}

func (a *app) Engine(sessionID string, promptContent string, promptConfig string, promptKey string, toolConfig *appdto.RoleToolConfig) (*engine.AgentEngine, error) {
	return a.build(sessionID, promptContent, promptConfig, promptKey, toolConfig)
}

func (a *app) setupTools(config *appdto.RoleToolConfig) []types.Tool {
	if config == nil {
		return nil
	}

	var tools []types.Tool

	for _, toolName := range config.Builtin {
		switch toolName {
		case "send_email":
			if config.EmailConfig != nil {
				tools = append(tools, builtin.NewEmailTool(&email.Config{
					Address: config.EmailConfig.Address,
					Name:    config.EmailConfig.Name,
					Pwd:     config.EmailConfig.Pwd,
					Host:    config.EmailConfig.Host,
					Port:    config.EmailConfig.Port,
				}))
			}
		case "command":
			tools = append(tools, builtin.NewCommandTool())
		case "file":
			tools = append(tools, builtin.NewFileTool())
		case "math_calculate":
			tools = append(tools, builtin.NewMathTool())
		case "net_check":
			tools = append(tools, builtin.NewPingTool())
		case "ssh":
			tools = append(tools, builtin.NewSSHTool())
		case "get_time":
			tools = append(tools, builtin.NewTimeTool())
		}
	}

	for _, mcpCfg := range config.MCP {
		if mcpCfg.URL == "" {
			continue
		}

		client := mcp.NewClient(mcpCfg.URL, "http", nil)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		err := client.Connect(ctx)
		cancel()

		if err != nil {
			slog.Error("Failed to connect to MCP server", "url", mcpCfg.URL, "error", err)
			continue
		}

		allTools := client.GetTools()
		if len(allTools) == 0 {
			continue
		}

		if len(mcpCfg.Tools) > 0 {
			allowedTools := make(map[string]bool)
			for _, t := range mcpCfg.Tools {
				allowedTools[t] = true
			}
			for _, t := range allTools {
				if allowedTools[t.Name()] {
					tools = append(tools, t)
				}
			}
		} else {
			tools = append(tools, allTools...)
		}
	}

	return tools
}

func (a *app) setupAgentConfig(promptContent string, promptKey string, agentSetting *appdto.AgentSetting) *types.AgentConfig {
	agentConfig := types.NewAgentConfig()

	if promptContent != "" {
		agentConfig.SystemMessage = promptContent
	} else if promptKey == "role_assistant" {
		agentConfig.SystemMessage = roleAssistantPrompt
	} else if agentSetting != nil && agentSetting.AgentConfig != nil {
		agentConfig.SystemMessage = agentSetting.AgentConfig.Prompt
	}

	return agentConfig
}

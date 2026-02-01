package chat

import (
	"context"
	"log/slog"
	"time"

	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/pkg/email"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
	"github.com/xichan96/cortex/agent/tools/builtin"
	"github.com/xichan96/cortex/agent/types"
	cortexemail "github.com/xichan96/cortex/pkg/email"
	"github.com/xichan96/cortex/pkg/mcp"
)

func (a *app) setupTools(ctx context.Context, roleID string, config *appdto.RoleToolConfig) []types.Tool {
	var tools []types.Tool

	// Experience tools are enabled by default
	userID := cctx.GetUserID[string](ctx)
	tools = append(tools,
		NewCreateExperienceTool(ctx, userID, roleID, a.knowledgeApp),
		NewUpdateExperienceTool(ctx, userID, a.knowledgeApp),
		NewDeleteExperienceTool(ctx, userID, a.knowledgeApp),
		NewGetExperienceTool(ctx, userID, a.knowledgeApp),
		NewSearchExperienceTool(ctx, userID, roleID, a.knowledgeApp),
		NewFuzzySearchExperienceTool(ctx, userID, roleID, a.knowledgeApp),
	)

	if config == nil {
		return tools
	}

	// 1. Builtin tools
	for _, toolName := range config.Builtin {
		switch toolName {
		case "send_email":
			if config.EmailConfig != nil {
				emailCfg := &cortexemail.Config{
					Address: config.EmailConfig.Address,
					Name:    config.EmailConfig.Name,
					Pwd:     config.EmailConfig.Pwd,
					Host:    config.EmailConfig.Host,
					Port:    config.EmailConfig.Port,
				}
				tools = append(tools, builtin.NewEmailTool(emailCfg))
			} else {
				slog.Warn("send_email tool enabled but no config provided")
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

	// 2. Notification tools (Call feature)
	// Role notifications
	var allowedRoleIDs []string
	for _, note := range config.RoleNotifications {
		allowedRoleIDs = append(allowedRoleIDs, note.TargetRoleIDs...)
	}
	if len(allowedRoleIDs) > 0 {
		tools = append(tools, NewNotifyRoleTool(ctx, userID, a, allowedRoleIDs))
	}

	// Human notifications
	var allowedEmails []string
	for _, note := range config.HumanNotifications {
		allowedEmails = append(allowedEmails, note.TargetEmails...)
	}
	if len(allowedEmails) > 0 && config.EmailConfig != nil {
		emailCfg := &email.Config{
			Host:     config.EmailConfig.Host,
			Port:     config.EmailConfig.Port,
			Username: config.EmailConfig.Address, // Assuming Address is Username
			Password: config.EmailConfig.Pwd,
			From:     config.EmailConfig.Address,
		}
		tools = append(tools, NewNotifyHumanTool(emailCfg, allowedEmails))
	}

	// 3. MCP tools
	for _, mcpCfg := range config.MCP {
		if mcpCfg.URL == "" {
			continue
		}

		// Use "http" transport by default
		client := mcp.NewClient(mcpCfg.URL, "http", nil)

		// Connect with timeout
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

		// If specific tools are listed, only add those; otherwise add all tools
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
			// If no specific tools listed, add all available tools
			tools = append(tools, allTools...)
		}
	}

	return tools
}

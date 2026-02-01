package chat

import (
	"context"
	"fmt"

	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/pkg/email"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
	"github.com/xichan96/cortex/agent/types"
)

// NotifyRoleTool allows an agent to send a message to another role
type NotifyRoleTool struct {
	ctx     context.Context
	userID  string
	app     AppIer
	allowed map[string]bool
}

func NewNotifyRoleTool(ctx context.Context, userID string, app AppIer, allowedRoleIDs []string) *NotifyRoleTool {
	allowed := make(map[string]bool)
	for _, id := range allowedRoleIDs {
		allowed[id] = true
	}
	return &NotifyRoleTool{
		ctx:     ctx,
		userID:  userID,
		app:     app,
		allowed: allowed,
	}
}

func (t *NotifyRoleTool) Name() string {
	return "notify_role"
}

func (t *NotifyRoleTool) Description() string {
	return "Send a message/notification to another AI role. Use this when you need to consult or notify another role."
}

func (t *NotifyRoleTool) Schema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"target_role_id": map[string]any{
				"type":        "string",
				"description": "The ID of the role to notify",
			},
			"content": map[string]any{
				"type":        "string",
				"description": "The message content to send",
			},
		},
		"required": []string{"target_role_id", "content"},
	}
}

func (t *NotifyRoleTool) Execute(args map[string]any) (any, error) {
	targetID, _ := args["target_role_id"].(string)
	content, _ := args["content"].(string)

	if targetID == "" || content == "" {
		return nil, fmt.Errorf("target_role_id and content are required")
	}

	if !t.allowed[targetID] {
		// return "", fmt.Errorf("permission denied: not allowed to notify role %s", targetID)
		// For now, allow notifying any role if the ID is known?
		// The requirement implies "Configured" notifications.
		// If I enforce allowed list, the model can only notify configured roles.
		// If the user selects roles in UI, they expect only those to be notified.
		return nil, fmt.Errorf("permission denied: role %s is not in the notification list", targetID)
	}

	// Create context with UserID as the tool execution happens in background or async
	// But here we share the context?
	// We need to ensure UserID is in context for CreateSession/SendMessage
	ctx := cctx.WithContext(t.ctx)
	cctx.SetUserID(ctx, t.userID)

	// Send message to target role
	// We assume a default provider/model for the target role since we don't know it.
	// TODO: Make this configurable or fetch from target role's preferences if available.
	// For now, hardcode "openai/gpt-4o" or similar generic one.
	provider := "openai"
	modelName := "gpt-4o"

	req := &appdto.SendChatMessageReq{
		Messages: []appdto.ChatMessageItem{
			{Role: "user", Content: content},
		},
	}

	// We don't have a sessionID for this interaction yet.
	// SendMessage will create one.
	// Note: This is a synchronous call. It might take time.
	// For "Notification", maybe we don't need the reply?
	// But usually we want the result.
	_, responseMsgs, err := t.app.SendMessage(ctx, targetID, provider, modelName, "", req)
	if err != nil {
		return nil, fmt.Errorf("failed to send message to role: %w", err)
	}

	if len(responseMsgs) > 0 {
		lastMsg := responseMsgs[len(responseMsgs)-1]
		return lastMsg.Content, nil
	}

	return "Message sent, but no response received", nil
}

func (t *NotifyRoleTool) Metadata() types.ToolMetadata {
	return types.ToolMetadata{
		ToolType: "builtin",
	}
}

// NotifyHumanTool allows an agent to send an email to a human
type NotifyHumanTool struct {
	emailSender *email.Client
	allowed     map[string]bool
}

func NewNotifyHumanTool(cfg *email.Config, allowedEmails []string) *NotifyHumanTool {
	allowed := make(map[string]bool)
	for _, e := range allowedEmails {
		allowed[e] = true
	}
	return &NotifyHumanTool{
		emailSender: email.New(cfg),
		allowed:     allowed,
	}
}

func (t *NotifyHumanTool) Name() string {
	return "notify_human"
}

func (t *NotifyHumanTool) Description() string {
	return "Send an email notification to a human."
}

func (t *NotifyHumanTool) Schema() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"target_email": map[string]any{
				"type":        "string",
				"description": "The email address to notify",
			},
			"content": map[string]any{
				"type":        "string",
				"description": "The email content",
			},
		},
		"required": []string{"target_email", "content"},
	}
}

func (t *NotifyHumanTool) Execute(args map[string]any) (any, error) {
	targetEmail, _ := args["target_email"].(string)
	content, _ := args["content"].(string)

	if targetEmail == "" || content == "" {
		return nil, fmt.Errorf("target_email and content are required")
	}

	if !t.allowed[targetEmail] {
		return nil, fmt.Errorf("permission denied: email %s is not in the notification list", targetEmail)
	}

	err := t.emailSender.Send(targetEmail, "Notification from Cortex Agent", content)
	if err != nil {
		return nil, fmt.Errorf("failed to send email: %w", err)
	}

	return "Email sent successfully", nil
}

func (t *NotifyHumanTool) Metadata() types.ToolMetadata {
	return types.ToolMetadata{
		ToolType: "builtin",
	}
}

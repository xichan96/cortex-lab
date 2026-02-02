package chat

import (
	"context"
	"fmt"
	"time"

	"github.com/jinzhu/copier"
	"github.com/xichan96/cortex-lab/internal/app/experience"
	"github.com/xichan96/cortex-lab/internal/app/role"
	"github.com/xichan96/cortex-lab/internal/app/setting"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/internal/infra/persist"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
	"github.com/xichan96/cortex/agent/engine"
	"github.com/xichan96/cortex/agent/types"
	"gorm.io/gorm"
)

const maxTitleLength = 50

func truncateTitle(text string) string {
	if len(text) <= maxTitleLength {
		return text
	}
	runes := []rune(text)
	if len(runes) <= maxTitleLength {
		return text
	}
	return string(runes[:maxTitleLength])
}

type AppIer interface {
	CreateSession(ctx context.Context, req *appdto.CreateChatSessionReq) (string, error)
	UpdateSessionTitle(ctx context.Context, req *appdto.UpdateChatSessionTitleReq) error
	DeleteSession(ctx context.Context, id string) error
	GetSession(ctx context.Context, id string) (*appdto.ChatSession, error)
	GetSessions(ctx context.Context, req *appdto.GetChatSessionsReq) ([]*appdto.ChatSession, int64, error)
	SendMessage(ctx context.Context, roleID, provider, modelName, sessionID string, req *appdto.SendChatMessageReq) (string, []*appdto.ChatMessage, error)
	GetMessages(ctx context.Context, sessionID string, req *appdto.GetChatMessagesReq) ([]*appdto.ChatMessage, int64, error)
	Engine(ctx context.Context, sessionID, roleID, provider, modelName string) (*engine.AgentEngine, error)
	PrepareStreamMessage(ctx context.Context, roleID, provider, modelName, sessionID string, userInput string) (string, *engine.AgentEngine, error)
}

type app struct {
	sp           persist.ChatSessionPersistIer
	mp           persist.ChatMessagePersistIer
	roleApp      role.AppIer
	settingSrv   setting.AppIer
	knowledgeApp experience.AppIer
}

func NewApp(sp persist.ChatSessionPersistIer, mp persist.ChatMessagePersistIer, roleApp role.AppIer, settingSrv setting.AppIer, knowledgeApp experience.AppIer) AppIer {
	return &app{sp: sp, mp: mp, roleApp: roleApp, settingSrv: settingSrv, knowledgeApp: knowledgeApp}
}

func (a *app) CreateSession(ctx context.Context, req *appdto.CreateChatSessionReq) (string, error) {
	userID := cctx.GetUserID[string](ctx)
	session := &model.ChatSession{
		UserID:    userID,
		RoleID:    req.RoleID,
		RoleName:  req.RoleName,
		Provider:  req.Provider,
		ModelName: req.ModelName,
		Title:     req.Title,
	}
	return a.sp.Create(ctx, session)
}

func (a *app) UpdateSessionTitle(ctx context.Context, req *appdto.UpdateChatSessionTitleReq) error {
	session, err := a.sp.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}
	session.Title = req.Title
	session.UpdatedAt = time.Now()
	return a.sp.Update(ctx, session)
}

func (a *app) DeleteSession(ctx context.Context, id string) error {
	session, err := a.sp.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return a.sp.Delete(ctx, session)
}

func (a *app) GetSession(ctx context.Context, id string) (*appdto.ChatSession, error) {
	session, err := a.sp.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	dto := &appdto.ChatSession{}
	_ = copier.Copy(dto, session)
	return dto, nil
}

func (a *app) GetSessions(ctx context.Context, req *appdto.GetChatSessionsReq) ([]*appdto.ChatSession, int64, error) {
	userID := cctx.GetUserID[string](ctx)
	opts := []func(*gorm.DB) *gorm.DB{
		func(db *gorm.DB) *gorm.DB {
			return db.Where("user_id = ?", userID)
		},
	}
	total, err := a.sp.Count(ctx, opts...)
	if err != nil {
		return nil, 0, err
	}
	// order by created_at desc
	opts = append(opts, func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at DESC")
	})
	if req.Page > 0 && req.PageSize > 0 {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			offset := (req.Page - 1) * req.PageSize
			return db.Offset(offset).Limit(req.PageSize)
		})
	}
	sessions, err := a.sp.GetList(ctx, opts...)
	if err != nil {
		return nil, 0, err
	}
	dtos := make([]*appdto.ChatSession, len(sessions))
	for i, s := range sessions {
		dto := &appdto.ChatSession{}
		_ = copier.Copy(dto, s)
		dtos[i] = dto
	}
	return dtos, total, nil
}

func (a *app) SendMessage(ctx context.Context, roleID, provider, modelName, sessionID string, req *appdto.SendChatMessageReq) (string, []*appdto.ChatMessage, error) {
	userID := cctx.GetUserID[string](ctx)

	var finalSessionID string
	if sessionID == "" {
		role, err := a.roleApp.GetRole(ctx, roleID)
		if err != nil {
			return "", nil, err
		}

		var title *string
		if len(req.Messages) > 0 {
			for _, msg := range req.Messages {
				if msg.Role == "user" && msg.Content != "" {
					truncated := truncateTitle(msg.Content)
					title = &truncated
					break
				}
			}
		}

		sessionReq := &appdto.CreateChatSessionReq{
			RoleID:    roleID,
			RoleName:  role.Name,
			Provider:  provider,
			ModelName: modelName,
			Title:     title,
		}
		finalSessionID, err = a.CreateSession(ctx, sessionReq)
		if err != nil {
			return "", nil, err
		}
	} else {
		session, err := a.sp.GetByID(ctx, sessionID)
		if err != nil {
			return "", nil, err
		}
		if session.UserID != userID {
			return "", nil, gorm.ErrRecordNotFound
		}
		if session.RoleID != roleID || session.Provider != provider || session.ModelName != modelName {
			// update session role/provider/model
			session.RoleID = roleID
			session.Provider = provider
			session.ModelName = modelName
			if err := a.sp.Update(ctx, session); err != nil {
				return "", nil, err
			}
		}
		finalSessionID = sessionID
	}

	userMessages := make([]*model.ChatMessage, 0)
	for _, msg := range req.Messages {
		if msg.Role == "user" {
			userMessages = append(userMessages, &model.ChatMessage{
				SessionID: finalSessionID,
				Role:      msg.Role,
				Content:   msg.Content,
			})
		}
	}

	if len(userMessages) > 0 {
		if err := a.mp.CreateBatch(ctx, userMessages); err != nil {
			return "", nil, err
		}
	}

	engine, err := a.Engine(ctx, finalSessionID, roleID, provider, modelName)
	if err != nil {
		return "", nil, fmt.Errorf("failed to create engine: %w", err)
	}

	var userInput string
	if len(req.Messages) > 0 {
		userInput = req.Messages[len(req.Messages)-1].Content
	}

	result, err := engine.Execute(userInput, nil)
	if err != nil {
		return "", nil, fmt.Errorf("failed to execute: %w", err)
	}

	assistantMsg := &model.ChatMessage{
		SessionID: finalSessionID,
		Role:      "assistant",
		Content:   result.Output,
	}
	if _, err := a.mp.Create(ctx, assistantMsg); err != nil {
		return "", nil, err
	}

	allMessages := append(userMessages, assistantMsg)
	dtos := make([]*appdto.ChatMessage, len(allMessages))
	for i, m := range allMessages {
		dto := &appdto.ChatMessage{}
		_ = copier.Copy(dto, m)
		if m.Meta != nil {
			dto.Meta = m.Meta
		}
		dtos[i] = dto
	}

	return finalSessionID, dtos, nil
}

func (a *app) GetMessages(ctx context.Context, sessionID string, req *appdto.GetChatMessagesReq) ([]*appdto.ChatMessage, int64, error) {
	userID := cctx.GetUserID[string](ctx)

	session, err := a.sp.GetByID(ctx, sessionID)
	if err != nil {
		return nil, 0, err
	}
	if session.UserID != userID {
		return nil, 0, gorm.ErrRecordNotFound
	}

	opts := []func(*gorm.DB) *gorm.DB{
		func(db *gorm.DB) *gorm.DB {
			return db.Where("session_id = ?", sessionID)
		},
	}

	total, err := a.mp.Count(ctx, opts...)
	if err != nil {
		return nil, 0, err
	}

	order := "ASC"
	if req.Order == "desc" {
		order = "DESC"
	}
	opts = append(opts, func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at " + order)
	})

	if req.Page > 0 && req.PageSize > 0 {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			offset := (req.Page - 1) * req.PageSize
			return db.Offset(offset).Limit(req.PageSize)
		})
	}

	messages, err := a.mp.GetList(ctx, opts...)
	if err != nil {
		return nil, 0, err
	}

	dtos := make([]*appdto.ChatMessage, len(messages))
	for i, m := range messages {
		dto := &appdto.ChatMessage{}
		_ = copier.Copy(dto, m)
		if m.Meta != nil {
			dto.Meta = m.Meta
		}
		dtos[i] = dto
	}

	return dtos, total, nil
}

func (a *app) Engine(ctx context.Context, sessionID, roleID, provider, modelName string) (*engine.AgentEngine, error) {
	llmProvider, err := a.setupLLM(provider, modelName)
	if err != nil {
		return nil, fmt.Errorf("failed to setup LLM: %w", err)
	}

	memorySetting, err := a.settingSrv.GetMemorySetting(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get memory setting: %w", err)
	}
	maxHistory := 100
	if memorySetting != nil && memorySetting.MemoryConfig != nil {
		if memorySetting.MemoryConfig.Simple.MaxHistoryMessages > 0 {
			maxHistory = memorySetting.MemoryConfig.Simple.MaxHistoryMessages
		} else if memorySetting.MemoryConfig.SQLite.MaxHistoryMessages > 0 {
			maxHistory = memorySetting.MemoryConfig.SQLite.MaxHistoryMessages
		} else if memorySetting.MemoryConfig.MySQL.MaxHistoryMessages > 0 {
			maxHistory = memorySetting.MemoryConfig.MySQL.MaxHistoryMessages
		} else if memorySetting.MemoryConfig.MongoDB.MaxHistoryMessages > 0 {
			maxHistory = memorySetting.MemoryConfig.MongoDB.MaxHistoryMessages
		} else if memorySetting.MemoryConfig.Redis.MaxHistoryMessages > 0 {
			maxHistory = memorySetting.MemoryConfig.Redis.MaxHistoryMessages
		}
	}
	memoryProvider := NewDatabaseMemoryProvider(a.mp, sessionID, maxHistory)

	roleInfo, err := a.roleApp.GetRole(ctx, roleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	experiences, _, err := a.knowledgeApp.GetExperienceList(ctx, roleID, &appdto.GetExperienceReq{})
	if err != nil {
		return nil, fmt.Errorf("failed to get experiences: %w", err)
	}

	systemMessage := a.loadRolePrompt(roleInfo, experiences)

	agentConfig := types.NewAgentConfig()
	if systemMessage != "" {
		agentConfig.SystemMessage = systemMessage
	}

	engine := engine.NewAgentEngine(llmProvider, agentConfig)
	engine.SetMemory(memoryProvider)

	// Setup tools from role configuration
	tools := a.setupTools(ctx, roleID, roleInfo.ToolConfig)
	if len(tools) > 0 {
		engine.AddTools(tools)
	}

	return engine, nil
}

func (a *app) PrepareStreamMessage(ctx context.Context, roleID, provider, modelName, sessionID string, userInput string) (string, *engine.AgentEngine, error) {
	userID := cctx.GetUserID[string](ctx)

	var finalSessionID string
	if sessionID == "" {
		role, err := a.roleApp.GetRole(ctx, roleID)
		if err != nil {
			return "", nil, err
		}

		var title *string
		if userInput != "" {
			truncated := truncateTitle(userInput)
			title = &truncated
		}

		sessionReq := &appdto.CreateChatSessionReq{
			RoleID:    roleID,
			RoleName:  role.Name,
			Provider:  provider,
			ModelName: modelName,
			Title:     title,
		}
		finalSessionID, err = a.CreateSession(ctx, sessionReq)
		if err != nil {
			return "", nil, err
		}
	} else {
		session, err := a.sp.GetByID(ctx, sessionID)
		if err != nil {
			return "", nil, err
		}
		if session.UserID != userID {
			return "", nil, gorm.ErrRecordNotFound
		}
		if session.RoleID != roleID || session.Provider != provider || session.ModelName != modelName {
			// update session role/provider/model
			session.RoleID = roleID
			session.Provider = provider
			session.ModelName = modelName
			if err := a.sp.Update(ctx, session); err != nil {
				return "", nil, err
			}
		}
		finalSessionID = sessionID
	}

	engine, err := a.Engine(ctx, finalSessionID, roleID, provider, modelName)
	if err != nil {
		return "", nil, fmt.Errorf("failed to create engine: %w", err)
	}

	return finalSessionID, engine, nil
}

func (a *app) loadRolePrompt(roleInfo *appdto.Role, experiences []*appdto.Experience) string {
	systemMessage := roleInfo.Prompt

	if roleInfo.Principle != "" {
		systemMessage += "\n\nPrinciple: " + roleInfo.Principle
	}

	if len(experiences) > 0 {
		systemMessage += "\n\nYou have access to a historical experience library. Follow these strict rules:\n" +
			"1. Answer strictly what the user asks. Do NOT provide information unrelated to the experience library.\n" +
			"2. Do NOT fabricate or hallucinate information.\n" +
			"3. Be direct and concise. NO pleasantries or small talk.\n" +
			"4. If the user's query involves multiple concepts or topics, or if you encounter ambiguity, prioritize using the 'fuzzy_search_experience' tool to find relevant experiences by keywords."
	}

	if roleInfo.ToolConfig != nil {
		var notificationInstructions string

		if len(roleInfo.ToolConfig.RoleNotifications) > 0 {
			notificationInstructions += "\n\nRole Notification Rules:\n"
			for _, note := range roleInfo.ToolConfig.RoleNotifications {
				notificationInstructions += fmt.Sprintf("- Condition: %s\n  Action: Notify roles %v\n  Content: %s\n", note.Trigger, note.TargetRoleIDs, note.Content)
			}
		}

		if len(roleInfo.ToolConfig.HumanNotifications) > 0 {
			notificationInstructions += "\n\nHuman Notification Rules:\n"
			for _, note := range roleInfo.ToolConfig.HumanNotifications {
				notificationInstructions += fmt.Sprintf("- Condition: %s\n  Action: Send email to %v\n  Content: %s\n", note.Trigger, note.TargetEmails, note.Content)
			}
		}

		if notificationInstructions != "" {
			systemMessage += notificationInstructions
		}
	}

	return systemMessage
}

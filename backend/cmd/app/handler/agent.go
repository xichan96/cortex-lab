package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/di"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
	"github.com/xichan96/cortex/trigger/http"
)

type agentChatRequest struct {
	Message       string `json:"message" binding:"required"`
	SessionID     string `json:"session_id"`
	PromptContent string `json:"prompt_content"`
	PromptConfig  string `json:"prompt_config"`
	PromptKey     string `json:"prompt_key"`
	RoleID        string `json:"role_id"`
}

// AgentStreamChatAPI Agent流式聊天接口
// @Summary Agent流式聊天接口
// @Description 与Agent进行流式对话交互
// @Tags Agent管理
// @Accept json
// @Produce text/event-stream
// @Router /api/agent/chat/stream [post]
func AgentStreamChatAPI(c *gin.Context) {
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	var reqBody agentChatRequest
	if len(bodyBytes) > 0 {
		if err := json.Unmarshal(bodyBytes, &reqBody); err != nil {
			gx.JSONErr(c, gx.BErr(err))
			return
		}
	}

	if reqBody.Message == "" {
		gx.JSONErr(c, gx.BErr(errors.New("message is required")))
		return
	}

	// Load prompt from setting if PromptKey is provided and PromptContent is empty
	// if reqBody.PromptContent == "" && reqBody.PromptKey != "" {
	// 	setting, err := di.SettingApp.GetSetting(c, "system_prompts", reqBody.PromptKey)
	// 	if err == nil && setting != nil {
	// 		reqBody.PromptContent = setting.Value
	// 	}
	// }

	if reqBody.SessionID == "" {
		reqBody.SessionID = uuid.New().String()
	}

	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var roleToolConfig *appdto.RoleToolConfig
	if reqBody.RoleID != "" {
		role, err := di.RoleApp.GetRole(c, reqBody.RoleID)
		if err == nil && role != nil {
			roleToolConfig = role.ToolConfig
		}
	}

	engine, err := di.AgentApp.Engine(reqBody.SessionID, reqBody.PromptContent, reqBody.PromptConfig, reqBody.PromptKey, roleToolConfig)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	httpHandler := http.NewHandler()
	req, err := httpHandler.GetMessageRequest(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	req.SessionID = reqBody.SessionID
	req.Message = reqBody.Message

	httpHandler.StreamChatAPI(c, engine, req)
}

// AgentChatAPI Agent聊天接口
// @Summary Agent聊天接口
// @Description 与Agent进行对话交互
// @Tags Agent管理
// @Accept json
// @Produce json
// @Router /api/agent/chat [post]
func AgentChatAPI(c *gin.Context) {
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	var reqBody agentChatRequest
	if len(bodyBytes) > 0 {
		if err := json.Unmarshal(bodyBytes, &reqBody); err != nil {
			gx.JSONErr(c, gx.BErr(err))
			return
		}
	}

	if reqBody.Message == "" {
		gx.JSONErr(c, gx.BErr(errors.New("message is required")))
		return
	}

	// Load prompt from setting if PromptKey is provided and PromptContent is empty
	// if reqBody.PromptContent == "" && reqBody.PromptKey != "" {
	// 	setting, err := di.SettingApp.GetSetting(c, "system_prompts", reqBody.PromptKey)
	// 	if err == nil && setting != nil {
	// 		reqBody.PromptContent = setting.Value
	// 	}
	// }

	if reqBody.SessionID == "" {
		reqBody.SessionID = uuid.New().String()
	}

	// Re-construct body for GetMessageRequest to avoid binding errors with extra fields
	cleanBody := map[string]string{
		"message":    reqBody.Message,
		"session_id": reqBody.SessionID,
	}
	cleanBodyBytes, _ := json.Marshal(cleanBody)
	c.Request.Body = io.NopCloser(bytes.NewBuffer(cleanBodyBytes))

	var roleToolConfig *appdto.RoleToolConfig
	if reqBody.RoleID != "" {
		role, err := di.RoleApp.GetRole(c, reqBody.RoleID)
		if err == nil && role != nil {
			roleToolConfig = role.ToolConfig
		}
	}

	engine, err := di.AgentApp.Engine(reqBody.SessionID, reqBody.PromptContent, reqBody.PromptConfig, reqBody.PromptKey, roleToolConfig)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	httpHandler := http.NewHandler()
	req, err := httpHandler.GetMessageRequest(c)
	if err != nil {
		// If headers already written (e.g. 400 by Bind), do not write again
		if !c.Writer.Written() {
			gx.JSONErr(c, err)
		}
		return
	}

	req.SessionID = reqBody.SessionID
	req.Message = reqBody.Message

	httpHandler.ChatAPI(c, engine, req)
}

// AgentSessionAPI 获取Agent会话ID
// @Summary 获取Agent会话ID
// @Description 获取新的会话ID用于Agent对话
// @Tags Agent管理
// @Produce json
// @Router /api/agent/session [post]
func AgentSessionAPI(c *gin.Context) {
	sessionID := uuid.New().String()
	gx.JSONSuccess(c, map[string]string{
		"session_id": sessionID,
	})
}

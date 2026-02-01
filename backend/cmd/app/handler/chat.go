package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/di"
	"github.com/xichan96/cortex-lab/pkg/ec"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
	httptrigger "github.com/xichan96/cortex/trigger/http"
)

// 6.3.2 获取会话列表（历史记录）
// @Summary Get Chat Sessions
// @Tags Chat
// @Accept json
// @Produce json
// @Param page query int false "Page"
// @Param page_size query int false "Page Size (max 100)"
// @Success 200 {object} gx.Response
// @Router /chat/session [get]
func GetChatSessionsAPI(c *gin.Context) {
	var req appdto.GetChatSessionsReq
	if err := c.ShouldBindQuery(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 20
	}
	if req.PageSize > 100 {
		req.PageSize = 100
	}

	list, total, err := di.ChatApp.GetSessions(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	gx.JSONSuccess(c, map[string]interface{}{
		"list":      list,
		"total":     total,
		"page":      req.Page,
		"page_size": req.PageSize,
	})
}

// 获取会话详情
// @Summary Get Chat Session Detail
// @Tags Chat
// @Accept json
// @Produce json
// @Param session_id path string true "Session ID"
// @Success 200 {object} gx.Response
// @Router /chat/session/{session_id} [get]
func GetChatSessionAPI(c *gin.Context) {
	id := c.Param("session_id")
	if id == "" {
		gx.JSONErr(c, gx.BErr(errors.New("session_id is required")))
		return
	}
	session, err := di.ChatApp.GetSession(c, id)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, session)
}

// 更新会话标题
// @Summary Update Chat Session Title
// @Tags Chat
// @Accept json
// @Produce json
// @Param session_id path string true "Session ID"
// @Param body body appdto.UpdateChatSessionTitleReq true "Update Title"
// @Success 200 {object} gx.Response
// @Router /chat/session/{session_id}/title [put]
func UpdateChatSessionTitleAPI(c *gin.Context) {
	id := c.Param("session_id")
	if id == "" {
		gx.JSONErr(c, gx.BErr(errors.New("session_id is required")))
		return
	}
	var req appdto.UpdateChatSessionTitleReq
	if err := gx.BindJSON(c, &req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	req.ID = id
	if err := di.ChatApp.UpdateSessionTitle(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// 6.3.4 删除会话（含历史消息）
// @Summary Delete Chat Session
// @Tags Chat
// @Accept json
// @Produce json
// @Param session_id path string true "Session ID"
// @Success 200 {object} gx.Response
// @Router /chat/session/{session_id} [delete]
func DeleteChatSessionAPI(c *gin.Context) {
	id := c.Param("session_id")
	if id == "" {
		gx.JSONErr(c, gx.BErr(errors.New("session_id is required")))
		return
	}
	if err := di.ChatApp.DeleteSession(c, id); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]bool{"deleted": true})
}

// 6.3.1 发送消息（携带角色/模型并按需创建会话）
// @Summary Send Chat Message
// @Tags Chat
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Param provider path string true "Provider"
// @Param model_name path string true "Model Name"
// @Param X-Chat-Session-Id header string false "Session ID"
// @Param body body appdto.SendChatMessageReq true "Message Request"
// @Success 200 {object} gx.Response
// @Router /chat/:role_id/model/:provider/:model_name [post]
func SendChatMessageAPI(c *gin.Context) {
	roleID := c.Param("role_id")
	provider := c.Param("provider")
	modelName := c.Param("model_name")
	sessionID := c.GetHeader("X-Chat-Session-Id")

	if roleID == "" || provider == "" || modelName == "" {
		gx.JSONErr(c, gx.BErr(errors.New("role_id, provider, model_name are required")))
		return
	}

	var req appdto.SendChatMessageReq
	if err := gx.BindJSON(c, &req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	sessionID, messages, err := di.ChatApp.SendMessage(c, roleID, provider, modelName, sessionID, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	c.Header("X-Chat-Session-Id", sessionID)
	gx.JSONSuccess(c, map[string]interface{}{
		"session_id": sessionID,
		"messages":   messages,
	})
}

// 6.3.3 查看会话消息记录
// @Summary Get Chat Messages
// @Tags Chat
// @Accept json
// @Produce json
// @Param session_id path string true "Session ID"
// @Param page query int false "Page"
// @Param page_size query int false "Page Size (max 100)"
// @Param order query string false "Order (asc/desc)"
// @Success 200 {object} gx.Response
// @Router /chat/session/:session_id/messages [get]
func GetChatMessagesAPI(c *gin.Context) {
	sessionID := c.Param("session_id")
	if sessionID == "" {
		gx.JSONErr(c, gx.BErr(errors.New("session_id is required")))
		return
	}

	var req appdto.GetChatMessagesReq
	if err := c.ShouldBindQuery(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 20
	}
	if req.PageSize > 100 {
		req.PageSize = 100
	}
	if req.Order == "" {
		req.Order = "asc"
	}

	list, total, err := di.ChatApp.GetMessages(c, sessionID, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	gx.JSONSuccess(c, map[string]interface{}{
		"list":      list,
		"total":     total,
		"page":      req.Page,
		"page_size": req.PageSize,
	})
}

func SendChatMessageStreamAPI(c *gin.Context) {
	roleID := c.Param("role_id")
	provider := c.Param("provider")
	modelName := c.Param("model_name")
	sessionID := c.GetHeader("X-Chat-Session-Id")
	if sessionID == "" {
		sessionID = ""
	}

	if roleID == "" || provider == "" || modelName == "" {
		gx.JSONErr(c, gx.BErr(errors.New("role_id, provider, model_name are required")))
		return
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	var req appdto.SendChatMessageReq
	if len(bodyBytes) > 0 {
		if err := json.Unmarshal(bodyBytes, &req); err != nil {
			gx.JSONErr(c, gx.BErr(err))
			return
		}
	}

	if len(req.Messages) == 0 {
		gx.JSONErr(c, gx.BErr(errors.New("messages are required")))
		return
	}

	userInput := req.Messages[len(req.Messages)-1].Content

	httpHandler := httptrigger.NewHandler()

	finalSessionID, engine, err := di.ChatApp.PrepareStreamMessage(c, roleID, provider, modelName, sessionID, userInput)
	if err != nil {
		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")

		var errMsg string
		var errCode *ec.ErrorCode
		if errors.As(err, &errCode) {
			errMsg = fmt.Sprintf("%d: %s", errCode.Code, errCode.Msg)
		} else {
			errMsg = err.Error()
		}

		event := httptrigger.SSEvent{
			Type:  "error",
			Error: errMsg,
		}
		eventData, _ := json.Marshal(event)
		fmt.Fprintf(c.Writer, "data: %s\n\n", eventData)
		if flusher, ok := c.Writer.(http.Flusher); ok {
			flusher.Flush()
		}
		return
	}

	c.Header("X-Chat-Session-Id", finalSessionID)

	reqMsg := &httptrigger.MessageRequest{
		SessionID: finalSessionID,
		Message:   userInput,
	}

	httpHandler.StreamChatAPI(c, engine, reqMsg)
}

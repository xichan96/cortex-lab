package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/di"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
)

// CreateSettingAPI
// @Summary Create Setting
// @Tags Setting
// @Accept json
// @Produce json
// @Param req body appdto.CreateSettingReq true "req"
// @Success 200 {object} gx.Response
// @Router /settings [post]
func CreateSettingAPI(c *gin.Context) {
	var req appdto.CreateSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	key, err := di.SettingApp.CreateSetting(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]string{"key": key})
}

// UpdateSettingAPI
// @Summary Update Setting
// @Tags Setting
// @Accept json
// @Produce json
// @Param req body appdto.UpdateSettingReq true "req"
// @Success 200 {object} gx.Response
// @Router /settings [put]
func UpdateSettingAPI(c *gin.Context) {
	var req appdto.UpdateSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := di.SettingApp.UpdateSetting(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetLLMSettingAPI       Get LLM Setting
// @Summary               Get LLM Setting
// @Tags                  Setting
// @Accept                json
// @Produce               json
// @Success               200     {object}    appdto.LLMSetting
// @Router                /settings/llm [get]
func GetLLMSettingAPI(c *gin.Context) {
	setting, err := di.SettingApp.GetLLMSetting(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, setting)
}

// UpdateLLMSettingAPI    Update LLM Setting
// @Summary               Update LLM Setting
// @Tags                  Setting
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.UpdateLLMSettingReq true    "req"
// @Success               200     {object}    gx.Response
// @Router                /settings/llm [put]
func UpdateLLMSettingAPI(c *gin.Context) {
	var req appdto.UpdateLLMSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := di.SettingApp.UpdateLLMSetting(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetChatLLMSettingAPI       Get Chat LLM Setting
// @Summary               Get Chat LLM Setting
// @Tags                  Setting
// @Accept                json
// @Produce               json
// @Success               200     {object}    appdto.ChatLLMSetting
// @Router                /settings/chat-llm [get]
func GetChatLLMSettingAPI(c *gin.Context) {
	setting, err := di.SettingApp.GetChatLLMSetting(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	maskSensitive := c.Query("mask_sensitive") == "true"

	if maskSensitive && setting != nil && setting.ChatLLMConfig != nil {
		setting.ChatLLMConfig.OpenAI.APIKey = ""
		setting.ChatLLMConfig.DeepSeek.APIKey = ""
		setting.ChatLLMConfig.Volce.APIKey = ""
	}
	gx.JSONSuccess(c, setting)
}

// UpdateChatLLMSettingAPI    Update Chat LLM Setting
// @Summary               Update Chat LLM Setting
// @Tags                  Setting
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.UpdateChatLLMSettingReq true    "req"
// @Success               200     {object}    gx.Response
// @Router                /settings/chat-llm [put]
func UpdateChatLLMSettingAPI(c *gin.Context) {
	var req appdto.UpdateChatLLMSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := di.SettingApp.UpdateChatLLMSetting(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetAgentSettingAPI     Get Agent Setting
// @Summary               Get Agent Setting
// @Tags                  Setting
// @Accept                json
// @Produce               json
// @Success               200     {object}    appdto.AgentSetting
// @Router                /settings/agent [get]
func GetAgentSettingAPI(c *gin.Context) {
	setting, err := di.SettingApp.GetAgentSetting(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, setting)
}

// UpdateAgentSettingAPI  Update Agent Setting
// @Summary               Update Agent Setting
// @Tags                  Setting
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.UpdateAgentSettingReq true    "req"
// @Success               200     {object}    gx.Response
// @Router                /settings/agent [put]
func UpdateAgentSettingAPI(c *gin.Context) {
	var req appdto.UpdateAgentSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := di.SettingApp.UpdateAgentSetting(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetMemorySettingAPI    Get Memory Setting
// @Summary               Get Memory Setting
// @Tags                  Setting
// @Accept                json
// @Produce               json
// @Success               200     {object}    appdto.MemorySetting
// @Router                /settings/memory [get]
func GetMemorySettingAPI(c *gin.Context) {
	setting, err := di.SettingApp.GetMemorySetting(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, setting)
}

// UpdateMemorySettingAPI Update Memory Setting
// @Summary               Update Memory Setting
// @Tags                  Setting
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.UpdateMemorySettingReq true    "req"
// @Success               200     {object}    gx.Response
// @Router                /settings/memory [put]
func UpdateMemorySettingAPI(c *gin.Context) {
	var req appdto.UpdateMemorySettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := di.SettingApp.UpdateMemorySetting(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetSettingsAPI
// @Summary Get Settings List
// @Tags Setting
// @Accept json
// @Produce json
// @Success 200 {object} gx.Response
// @Router /settings [get]
func GetSettingsAPI(c *gin.Context) {
	settings, err := di.SettingApp.GetSettings(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, settings)
}

// GetSettingAPI
// @Summary Get Setting
// @Tags Setting
// @Accept json
// @Produce json
// @Param group path string true "group"
// @Param key path string true "key"
// @Success 200 {object} gx.Response
// @Router /settings/{group}/{key} [get]
func GetSettingAPI(c *gin.Context) {
	group := c.Param("group")
	key := c.Param("key")
	setting, err := di.SettingApp.GetSetting(c, group, key)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, setting)
}

// DeleteSettingAPI
// @Summary Delete Setting
// @Tags Setting
// @Accept json
// @Produce json
// @Param group path string true "group"
// @Param key path string true "key"
// @Success 200 {object} gx.Response
// @Router /settings/{group}/{key} [delete]
func DeleteSettingAPI(c *gin.Context) {
	group := c.Param("group")
	key := c.Param("key")
	if err := di.SettingApp.DeleteSetting(c, group, key); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

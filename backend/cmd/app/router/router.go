package router

import (
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/xichan96/cortex-lab/cmd/app/handler"
	"github.com/xichan96/cortex-lab/cmd/app/middleware"
)

func RegisterAPIRouter(r *gin.Engine) {
	api := r.Group("/api")
	{
		setup := api.Group("/setup")
		{
			setup.GET("/check", handler.CheckInstallAPI)
			setup.POST("/install", handler.InstallAPI)
		}

		api.POST("/login", handler.LoginAPI)
		api.POST("/auth/register", handler.RegisterAPI)
		api.POST("/auth/login", handler.LoginAPI)
		api.POST("/auth/logout", middleware.Auth(), handler.LogoutAPI)
		api.GET("/auth/me", middleware.Auth(), handler.MeAPI)

		users := api.Group("/users", middleware.Auth())
		{
			users.POST("", middleware.AdminRoleMiddleware(), handler.CreateUserAPI)
			users.GET("", middleware.AdminRoleMiddleware(), handler.GetUsersAPI)
			users.PUT("/:user_id", handler.UpdateUserAPI)
			users.DELETE("/:user_id", middleware.AdminRoleMiddleware(), handler.DeleteUserAPI)
		}

		roles := api.Group("/roles", middleware.Auth())
		{
			roles.GET("", handler.GetRolesAPI)
			roles.POST("", handler.CreateRoleAPI)
			roles.GET("/:role_id", handler.GetRoleAPI)
			roles.PUT("/:role_id", handler.UpdateRoleAPI)
			roles.DELETE("/:role_id", handler.DeleteRoleAPI)
		}

		experiences := api.Group("/experiences", middleware.Auth())
		{
			experiences.GET("/search", handler.SearchExperienceAPI)
			experiences.POST("", handler.CreateExperienceAPI)
			experiences.GET("/:id", handler.GetExperienceAPI)
			experiences.PUT("/:id", handler.UpdateExperienceAPI)
			experiences.DELETE("/:id", handler.DeleteExperienceAPI)
		}

		settings := api.Group("/settings", middleware.Auth())
		{
			settings.POST("", handler.CreateSettingAPI)
			settings.PUT("", handler.UpdateSettingAPI)
			settings.GET("", handler.GetSettingsAPI)
			settings.GET("/:group/:key", handler.GetSettingAPI)
			settings.DELETE("/:group/:key", handler.DeleteSettingAPI)

			settings.GET("/llm", handler.GetLLMSettingAPI)
			settings.PUT("/llm", handler.UpdateLLMSettingAPI)
			settings.GET("/chat-llm", handler.GetChatLLMSettingAPI)
			settings.PUT("/chat-llm", handler.UpdateChatLLMSettingAPI)
			settings.GET("/agent", handler.GetAgentSettingAPI)
			settings.PUT("/agent", handler.UpdateAgentSettingAPI)
			settings.GET("/memory", handler.GetMemorySettingAPI)
			settings.PUT("/memory", handler.UpdateMemorySettingAPI)
		}

		agent := api.Group("/agent", middleware.Auth())
		{
			agent.POST("/chat/stream", handler.AgentStreamChatAPI)
			agent.POST("/chat", handler.AgentChatAPI)
			agent.POST("/session", handler.AgentSessionAPI)
		}

		mcp := api.Group("/mcp", middleware.Auth())
		{
			mcp.POST("/tools/fetch", handler.FetchMCPToolsAPI)
		}

		llm := api.Group("/llm", middleware.Auth())
		{
			llm.POST("/models/fetch", handler.FetchLLMModelsAPI)
		}

		chat := api.Group("/chat", middleware.Auth())
		{
			chat.POST("/:role_id/model/:provider/:model_name", handler.SendChatMessageAPI)
			chat.POST("/:role_id/model/:provider/:model_name/stream", handler.SendChatMessageStreamAPI)
			chat.GET("/session", handler.GetChatSessionsAPI)
			chat.GET("/session/:session_id", handler.GetChatSessionAPI)
			chat.GET("/session/:session_id/messages", handler.GetChatMessagesAPI)
			chat.PUT("/session/:session_id/title", handler.UpdateChatSessionTitleAPI)
			chat.DELETE("/session/:session_id", handler.DeleteChatSessionAPI)
		}

		/*
			skills := api.Group("/skills", middleware.Auth())
			{
				skills.POST("", handler.CreateSkillAPI)
				skills.GET("", handler.GetSkillsAPI)
				skills.PUT("/:skill_id", handler.UpdateSkillAPI)
				skills.DELETE("/:skill_id", handler.DeleteSkillAPI)
				promptRouter := skills.Group("/:skill_id/prompts", middleware.SkillAccessMiddleware())
				{
					promptRouter.POST("", handler.CreatePromptAPI)
					promptRouter.GET("", handler.GetPromptListAPI)
					promptRouter.PUT("/:prompt_id", handler.UpdatePromptAPI)
					promptRouter.POST("/:prompt_id/publish", handler.PublishPromptAPI)
					promptRouter.DELETE("/:prompt_id", handler.DeletePromptAPI)
					promptRouter.GET("/:prompt_id", handler.GetPromptAPI)
				}

				fileRouter := skills.Group("/:skill_id/files", middleware.SkillAccessMiddleware())
				{
					fileRouter.POST("", handler.CreateSkillFileAPI)
					fileRouter.GET("", handler.GetSkillFileListAPI)
					fileRouter.PUT("/:file_id", handler.UpdateSkillFileAPI)
					fileRouter.DELETE("/:file_id", handler.DeleteSkillFileAPI)
					fileRouter.GET("/:file_id", handler.GetSkillFileAPI)
				}
			}

			settings := api.Group("/settings", middleware.Auth(), middleware.AdminRoleMiddleware())
			{
				settings.POST("", handler.CreateSettingAPI)
				settings.GET("", handler.GetSettingsAPI)
				settings.POST("/get", handler.GetSettingAPI)
				settings.PUT("", handler.UpdateSettingAPI)
				settings.DELETE("", handler.DeleteSettingAPI)
				settings.GET("/llm", handler.GetLLMSettingAPI)
				settings.PUT("/llm", handler.UpdateLLMSettingAPI)
				settings.GET("/agent", handler.GetAgentSettingAPI)
				settings.PUT("/agent", handler.UpdateAgentSettingAPI)
				settings.GET("/memory", handler.GetMemorySettingAPI)
				settings.PUT("/memory", handler.UpdateMemorySettingAPI)
			}

			agent := api.Group("/agent", middleware.Auth())
			{
				agent.POST("/session", handler.AgentSessionAPI)
				agent.POST("/chat", handler.AgentChatAPI)
				agent.POST("/chat/stream", handler.AgentStreamChatAPI)
			}

			tools := api.Group("/tools", middleware.Auth())
			{
				tools.POST("/run_agent", handler.RunAgentToolAPI)
				tools.GET("/prompts", handler.GetPromptListToolAPI)
				tools.GET("/prompt", handler.GetPromptToolAPI)
				tools.GET("/files", handler.ListSkillFilesToolAPI)
				tools.GET("/file", handler.GetSkillFileToolAPI)
			}
		*/
	}

	/*
		mcp := r.Group("/mcp", middleware.Auth())
		{
			h := mcphandler.NewMcpHandler()
			mcp.Any("/*path", gin.WrapH(h))
		}
	*/

	// Serve static files
	r.Static("/assets", "./frontend/dist/assets")

	// Serve index.html for non-API routes (SPA support)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if !strings.HasPrefix(path, "/api") && !strings.HasPrefix(path, "/mcp") {
			c.File("./frontend/dist/index.html")
		}
	})
}

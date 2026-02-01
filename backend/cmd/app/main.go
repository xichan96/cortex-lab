// @title           Prompt Hub API
// @version         1.0
// @description     Prompt Hub API 文档
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8088
// @BasePath  /api

// @schemes   http https5
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/cmd/app/handler"
	"github.com/xichan96/cortex-lab/cmd/app/router"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/config"
	"github.com/xichan96/cortex-lab/internal/di"
	"github.com/xichan96/cortex-lab/internal/infra/migrate"
	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/internal/infra/persist"
	"github.com/xichan96/cortex-lab/pkg/ec"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func main() {
	config.InitConfig()
	config.InitVariable()

	if !config.IsInstalled() {
		if err := runSetup(); err != nil {
			panic(err)
		}
		// Reload config after setup
		config.InitConfig()
	}

	if err := migrate.EnsureDatabase(); err != nil {
		panic(err)
	}
	migrate.MigrateTable()

	initAdminUser()
	initLLMSetting()
	initAgentSetting()
	initMemorySetting()

	s := gx.NewServer()
	router.RegisterAPIRouter(s.Engine)
	s.Run()
}

func initAdminUser() {
	ctx := context.Background()
	up := persist.NewUserPersist()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("adminadmin"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	user, err := up.GetByUsername(ctx, "admin")

	if err != nil && (errors.Is(err, gorm.ErrRecordNotFound) || ec.IsErrCode(err, ec.NoFound)) {
		_, err = up.Create(ctx, &model.User{
			Username:     "admin",
			PasswordHash: string(hashedPassword),
			Role:         "admin",
		})
		if err != nil {
			log.Fatal(err)
		}
		log.Println("Admin user initialized")
	} else if err != nil {
		log.Fatal(err)
	} else {
		user.PasswordHash = string(hashedPassword)
		user.Role = "admin"
		if err := up.Update(ctx, user); err != nil {
			log.Fatal(err)
		}
		log.Println("Admin user password updated")
	}
}

func initLLMSetting() {
	ctx := context.Background()
	settingApp := di.SettingApp

	llmSetting, err := settingApp.GetLLMSetting(ctx)
	if err != nil {
		log.Fatal(err)
	}

	if llmSetting == nil || llmSetting.LLMConfig == nil || llmSetting.LLMConfig.Provider == "" {
		defaultConfig := &appdto.UpdateLLMSettingReq{
			LLMConfig: &appdto.LLMConfig{
				Provider: "openai",
				OpenAI: appdto.OpenAIConfig{
					APIKey:  "",
					BaseURL: "https://api.openai.com/v1",
					Model:   "gpt-3.5-turbo",
					OrgID:   "",
					APIType: "open_ai",
				},
				DeepSeek: appdto.DeepSeekConfig{
					APIKey:  "",
					BaseURL: "https://api.deepseek.com",
					Model:   "deepseek-chat",
				},
				Volce: appdto.VolceConfig{
					APIKey:  "",
					BaseURL: "",
					Model:   "",
				},
			},
		}
		err = settingApp.UpdateLLMSetting(ctx, defaultConfig)
		if err != nil {
			log.Fatal(err)
		}
		log.Println("LLM setting initialized")
	}
}

func initAgentSetting() {
	ctx := context.Background()
	settingApp := di.SettingApp

	agentSetting, err := settingApp.GetAgentSetting(ctx)
	if err != nil {
		log.Fatal(err)
	}

	if agentSetting == nil || agentSetting.AgentConfig == nil || agentSetting.AgentConfig.Name == "" {
		defaultConfig := &appdto.UpdateAgentSettingReq{
			AgentConfig: &appdto.AgentConfig{
				Name:   "",
				Prompt: "",
				Tools:  []string{},
			},
		}
		err = settingApp.UpdateAgentSetting(ctx, defaultConfig)
		if err != nil {
			log.Fatal(err)
		}
		log.Println("Agent setting initialized")
	}
}

func initMemorySetting() {
	ctx := context.Background()
	settingApp := di.SettingApp

	memorySetting, err := settingApp.GetMemorySetting(ctx)
	if err != nil {
		log.Fatal(err)
	}

	if memorySetting == nil || memorySetting.MemoryConfig == nil || memorySetting.MemoryConfig.Provider == "" {
		defaultConfig := &appdto.UpdateMemorySettingReq{
			MemoryConfig: &appdto.MemoryConfig{
				Provider: "simple",
				Simple: appdto.SimpleMemoryConfig{
					MaxHistoryMessages: 10,
				},
				MongoDB: appdto.MongoDBMemoryConfig{
					URI:                "",
					Database:           "",
					Collection:         "",
					MaxHistoryMessages: 10,
				},
				Redis: appdto.RedisMemoryConfig{
					Host:               "",
					Port:               6379,
					Username:           "",
					Password:           "",
					DB:                 0,
					KeyPrefix:          "cortex-lab:memory:",
					MaxHistoryMessages: 10,
				},
			},
		}
		err = settingApp.UpdateMemorySetting(ctx, defaultConfig)
		if err != nil {
			log.Fatal(err)
		}
		log.Println("Memory setting initialized")
	}
}

func runSetup() error {
	s := gx.NewServer()
	// Register setup routes manually to intercept installation success
	setup := s.Engine.Group("/api/setup")
	setup.GET("/check", handler.CheckInstallAPI)

	installDone := make(chan struct{})

	setup.POST("/install", func(c *gin.Context) {
		handler.InstallAPI(c)
		// If successful (status 200), signal shutdown
		if c.Writer.Status() == 200 {
			// Signal in a goroutine to allow response to flush
			go func() {
				time.Sleep(1 * time.Second)
				close(installDone)
			}()
		}
	})

	// Start server
	go func() {
		log.Println("Setup required. Listening on :8088")
		if err := s.Server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			panic(err)
		}
	}()

	// Wait for install done
	<-installDone

	// Shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.Server.Shutdown(ctx)
}

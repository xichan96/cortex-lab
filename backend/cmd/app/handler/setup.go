package handler

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/internal/config"
	"github.com/xichan96/cortex-lab/internal/infra/migrate"
	"github.com/xichan96/cortex-lab/pkg/sql"
	"github.com/xichan96/cortex-lab/pkg/sql/mysql"
	"github.com/xichan96/cortex-lab/pkg/sql/sqlite"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
	"gorm.io/gorm"
)

type InstallReq struct {
	DBDriver string `json:"db_driver" binding:"required,oneof=mysql sqlite"`
	// MySQL specific
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	Database string `json:"database"`
	// SQLite specific
	Path string `json:"path"`
}

// CheckInstallAPI Check if system is installed
// @Summary Check if system is installed
// @Tags Setup
// @Accept json
// @Produce json
// @Success 200 {object} gx.Response
// @Router /setup/check [get]
func CheckInstallAPI(c *gin.Context) {
	gx.JSONSuccess(c, gin.H{"installed": config.IsInstalled()})
}

// InstallAPI Install system
// @Summary Install system
// @Tags Setup
// @Accept json
// @Produce json
// @Param req body InstallReq true "req"
// @Success 200 {object} gx.Response
// @Router /setup/install [post]
func InstallAPI(c *gin.Context) {
	if config.IsInstalled() {
		gx.JSONErr(c, errors.New("system already installed"))
		return
	}

	var req InstallReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	// Update config object
	config.Config.DBDriver = req.DBDriver
	if req.DBDriver == "mysql" {
		config.Config.Mysql = &mysql.Config{
			Host:     req.Host,
			Port:     req.Port,
			User:     req.User,
			Password: req.Password,
			Database: req.Database,
		}
	} else {
		config.Config.Sqlite = &sqlite.Config{
			Path: req.Path,
		}
	}

	// Try to connect to database
	db, err := config.ConnectDB()
	if err != nil {
		gx.JSONErr(c, errors.New("failed to connect to database: "+err.Error()))
		return
	}

	// Temporarily set Var.DB for migration
	config.Var.DB = db
	sql.SetDefaultDB(func() *gorm.DB {
		return config.Var.DB
	})

	// Run Migrations
	if err := migrate.EnsureDatabase(); err != nil {
		gx.JSONErr(c, errors.New("failed to ensure database: "+err.Error()))
		return
	}
	migrate.MigrateTable()

	// Save Config
	if err := config.SaveConfig(config.Config); err != nil {
		gx.JSONErr(c, errors.New("failed to save config: "+err.Error()))
		return
	}

	gx.JSONSuccess(c, nil)
}

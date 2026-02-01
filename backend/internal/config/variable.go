package config

import (
	"github.com/xichan96/cortex-lab/pkg/log"
	"github.com/xichan96/cortex-lab/pkg/sql"
	"github.com/xichan96/cortex-lab/pkg/sql/mysql"
	"github.com/xichan96/cortex-lab/pkg/sql/sqlite"
	"gorm.io/gorm"
)

var Var = variable{}

type variable struct {
	DB *gorm.DB
}

func ConnectDB() (*gorm.DB, error) {
	var err error
	var db *gorm.DB

	if Config.DBDriver == "sqlite" {
		var client *sqlite.Client
		client, err = sqlite.NewClient(Config.Sqlite)
		if err == nil {
			db = client.DB
		}
	} else {
		// Default to MySQL
		var client *mysql.Client
		client, err = mysql.NewClient(Config.Mysql)
		if err == nil {
			db = client.DB
		}
	}
	return db, err
}

func InitVariable() {
	db, err := ConnectDB()
	if err != nil {
		log.Fatal(err)
	}

	Var.DB = db
	sql.SetDefaultDB(func() *gorm.DB {
		return Var.DB
	})
}

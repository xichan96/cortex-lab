package config

import (
	"os"
	"strconv"

	"gopkg.in/yaml.v3"

	"github.com/xichan96/cortex-lab/pkg/sql/mysql"
	"github.com/xichan96/cortex-lab/pkg/sql/sqlite"
)

var Env = os.Getenv("CONFIG_ENV")

var Config = &config{}

var ConfigFile = "config.yaml"

type config struct {
	DBDriver string         `json:"db_driver" yaml:"db_driver"`
	Mysql    *mysql.Config  `json:"mysql" yaml:"mysql"`
	Sqlite   *sqlite.Config `json:"sqlite" yaml:"sqlite"`
}

func InitConfig() {
	if envConfigFile := os.Getenv("CONFIG_FILE"); envConfigFile != "" {
		ConfigFile = envConfigFile
	}

	if IsInstalled() {
		data, err := os.ReadFile(ConfigFile)
		if err == nil {
			if err := yaml.Unmarshal(data, Config); err == nil {
				return
			} else {
				// Print error to stdout/stderr so we can see it in docker logs
				println("Error unmarshalling config file:", err.Error())
			}
		} else {
			println("Error reading config file:", err.Error())
		}
	} else {
		println("Config file not found:", ConfigFile)
	}

	Config.DBDriver = getEnv("DB_DRIVER", "mysql")

	// MySQL Config
	portStr := getEnv("DB_PORT", "3306")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 3306
	}

	Config.Mysql = &mysql.Config{
		Host:     getEnv("DB_HOST", "127.0.0.1"),
		Port:     port,
		User:     getEnv("DB_USER", "root"),
		Password: getEnv("DB_PASSWORD", "youpasswd"),
		Database: getEnv("DB_NAME", "cortex_lab"),
	}

	// SQLite Config
	Config.Sqlite = &sqlite.Config{
		Path: getEnv("SQLITE_PATH", "cortex_lab.db"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func IsInstalled() bool {
	_, err := os.Stat(ConfigFile)
	return err == nil
}

func SaveConfig(cfg *config) error {
	data, err := yaml.Marshal(cfg)
	if err != nil {
		return err
	}
	return os.WriteFile(ConfigFile, data, 0644)
}

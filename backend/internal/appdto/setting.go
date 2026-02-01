package appdto

type Setting struct {
	Group     string `json:"group"`
	Key       string `json:"key"`
	Value     string `json:"value"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type CreateSettingReq struct {
	Group string `json:"group" binding:"required"`
	Key   string `json:"key" binding:"required"`
	Value string `json:"value" binding:"required"`
}

type DeleteSettingReq struct {
	Group string `json:"group" validate:"required,min=1,max=64"`
	Key   string `json:"key" validate:"required,min=1,max=64"`
}

type GetSettingReq struct {
	Group string `json:"group" validate:"required,min=1,max=64"`
	Key   string `json:"key" validate:"required,min=1,max=64"`
}

type GetSettingsReq struct {
	Group string `json:"group" validate:"omitempty,min=1,max=64"`
}

type LLMConfig struct {
	Provider string         `yaml:"provider" json:"provider"`
	OpenAI   OpenAIConfig   `yaml:"openai" json:"openai"`
	DeepSeek DeepSeekConfig `yaml:"deepseek" json:"deepseek"`
	Volce    VolceConfig    `yaml:"volce" json:"volce"`
}

type OpenAIConfig struct {
	APIKey  string `yaml:"api_key" json:"api_key"`
	BaseURL string `yaml:"base_url" json:"base_url"`
	Model   string `yaml:"model" json:"model"`
	OrgID   string `yaml:"org_id" json:"org_id"`
	APIType string `yaml:"api_type" json:"api_type"`
}

type DeepSeekConfig struct {
	APIKey  string `yaml:"api_key" json:"api_key"`
	BaseURL string `yaml:"base_url" json:"base_url"`
	Model   string `yaml:"model" json:"model"`
}

type VolceConfig struct {
	APIKey  string `yaml:"api_key" json:"api_key"`
	BaseURL string `yaml:"base_url" json:"base_url"`
	Model   string `yaml:"model" json:"model"`
}

type LLMSetting struct {
	*LLMConfig
}

type UpdateLLMSettingReq struct {
	*LLMConfig
}

type ChatLLMConfig struct {
	OpenAI   ChatOpenAIConfig   `yaml:"openai" json:"openai"`
	DeepSeek ChatDeepSeekConfig `yaml:"deepseek" json:"deepseek"`
	Volce    ChatVolceConfig    `yaml:"volce" json:"volce"`
}

type ChatOpenAIConfig struct {
	APIKey  string   `yaml:"api_key" json:"api_key"`
	BaseURL string   `yaml:"base_url" json:"base_url"`
	Models  []string `yaml:"models" json:"models"`
	OrgID   string   `yaml:"org_id" json:"org_id"`
	APIType string   `yaml:"api_type" json:"api_type"`
}

type ChatDeepSeekConfig struct {
	APIKey  string   `yaml:"api_key" json:"api_key"`
	BaseURL string   `yaml:"base_url" json:"base_url"`
	Models  []string `yaml:"models" json:"models"`
}

type ChatVolceConfig struct {
	APIKey  string   `yaml:"api_key" json:"api_key"`
	BaseURL string   `yaml:"base_url" json:"base_url"`
	Models  []string `yaml:"models" json:"models"`
}

type ChatLLMSetting struct {
	*ChatLLMConfig
}

type UpdateChatLLMSettingReq struct {
	*ChatLLMConfig
}

type AgentConfig struct {
	Name   string   `json:"name"`
	Prompt string   `json:"prompt"`
	Tools  []string `json:"tools"`
}

type AgentSetting struct {
	*AgentConfig
}

type UpdateAgentSettingReq struct {
	*AgentConfig
}

type SimpleMemoryConfig struct {
	MaxHistoryMessages int `json:"max_history_messages" yaml:"max_history_messages"`
}

type MongoDBMemoryConfig struct {
	URI                string `json:"uri" yaml:"uri"`
	Database           string `json:"database" yaml:"database"`
	Collection         string `json:"collection" yaml:"collection"`
	MaxHistoryMessages int    `json:"max_history_messages" yaml:"max_history_messages"`
}

type RedisMemoryConfig struct {
	Host               string `json:"host" yaml:"host"`
	Port               int    `json:"port" yaml:"port"`
	Username           string `json:"username" yaml:"username"`
	Password           string `json:"password" yaml:"password"`
	DB                 int    `json:"db" yaml:"db"`
	KeyPrefix          string `json:"key_prefix" yaml:"key_prefix"`
	MaxHistoryMessages int    `json:"max_history_messages" yaml:"max_history_messages"`
}

type SQLiteMemoryConfig struct {
	DSN                string `json:"dsn" yaml:"dsn"`
	TableName          string `json:"table_name" yaml:"table_name"`
	MaxHistoryMessages int    `json:"max_history_messages" yaml:"max_history_messages"`
}

type MySQLMemoryConfig struct {
	Host               string `json:"host" yaml:"host"`
	Port               int    `json:"port" yaml:"port"`
	Username           string `json:"username" yaml:"username"`
	Password           string `json:"password" yaml:"password"`
	Database           string `json:"database" yaml:"database"`
	TableName          string `json:"table_name" yaml:"table_name"`
	MaxHistoryMessages int    `json:"max_history_messages" yaml:"max_history_messages"`
}

type MemoryConfig struct {
	Provider string              `json:"provider" yaml:"provider"` // simple, mongodb, redis, sqlite, mysql
	Simple   SimpleMemoryConfig  `json:"simple" yaml:"simple"`
	MongoDB  MongoDBMemoryConfig `json:"mongodb" yaml:"mongodb"`
	Redis    RedisMemoryConfig   `json:"redis" yaml:"redis"`
	SQLite   SQLiteMemoryConfig  `json:"sqlite" yaml:"sqlite"`
	MySQL    MySQLMemoryConfig   `json:"mysql" yaml:"mysql"`
}

type MemorySetting struct {
	*MemoryConfig
}

type UpdateMemorySettingReq struct {
	*MemoryConfig
}

type UpdateSettingReq struct {
	Group string `json:"group" binding:"required"`
	Key   string `json:"key" binding:"required"`
	Value string `json:"value"`
}

package email

import (
	"fmt"
	"net/smtp"
)

type Config struct {
	Host     string `json:"host" yaml:"host"`
	Port     int    `json:"port" yaml:"port"`
	Username string `json:"username" yaml:"username"`
	Password string `json:"password" yaml:"password"`
	From     string `json:"from" yaml:"from"`
}

type Client struct {
	cfg *Config
}

func New(cfg *Config) *Client {
	return &Client{cfg: cfg}
}

func (c *Client) Send(to, subject, body string) error {
	addr := fmt.Sprintf("%s:%d", c.cfg.Host, c.cfg.Port)
	auth := smtp.PlainAuth("", c.cfg.Username, c.cfg.Password, c.cfg.Host)

	msg := []byte(fmt.Sprintf("To: %s\r\n"+
		"Subject: %s\r\n"+
		"\r\n"+
		"%s\r\n", to, subject, body))

	return smtp.SendMail(addr, auth, c.cfg.From, []string{to}, msg)
}

package gx

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/pkg/log"
	"github.com/xichan96/cortex-lab/pkg/web/gx/validation"
)

const (
	defaultPort            = 8088
	defaultHost            = "0.0.0.0"
	defaultShutdownTimeout = 60 * time.Second
)

var defaultMiddlewares = []gin.HandlerFunc{
	ContextKeeper,
	Logger(),
	Recovery(),
	RequestID(RequestIDKey),
}

type ServerConfig struct {
	Port               int
	Host               string
	DisableValidation  bool
	ShutdownTimeout    time.Duration
	DefaultMiddlewares []gin.HandlerFunc
	ExtMiddlewares     []gin.HandlerFunc
}

type Server struct {
	cfg    *ServerConfig
	Engine *gin.Engine
	Server *http.Server
}

func Default(ms ...gin.HandlerFunc) *gin.Engine {
	engine := gin.New()
	engine.GET("/healthz", HealthAPI)
	engine.Use(ms...)
	return engine
}

func NewServer(opts ...ServerOption) *Server {
	c := &ServerConfig{}
	for _, opt := range opts {
		opt(c)
	}
	return NewServerWithConfig(c)
}

func NewServerWithConfig(c *ServerConfig) *Server {
	if c == nil {
		c = &ServerConfig{}
	}

	if c.Port == 0 {
		c.Port = defaultPort
	}
	if len(c.Host) == 0 {
		c.Host = defaultHost
	}
	if c.ShutdownTimeout == 0 {
		c.ShutdownTimeout = defaultShutdownTimeout
	}

	middles := defaultMiddlewares
	if len(c.DefaultMiddlewares) > 0 {
		middles = c.DefaultMiddlewares
	}
	middles = append(middles, c.ExtMiddlewares...)

	if !c.DisableValidation {
		validation.UseDefaultValidator()
		if err := validation.RegisterValidations(validation.DefaultValidator...); err != nil {
			log.Error(err)
		}
	}

	engine := Default(middles...)

	return &Server{
		cfg:    c,
		Engine: engine,
		Server: &http.Server{
			Addr:         fmt.Sprintf("%s:%d", c.Host, c.Port),
			Handler:      engine,
			ReadTimeout:  300 * time.Second,
			WriteTimeout: 300 * time.Second,
		},
	}
}

func (s *Server) UseValidation(vs ...validation.CustomValidation) error {
	return validation.RegisterValidations(vs...)
}

func (s *Server) Run() {
	go func() {
		log.Infof("listen in %s", s.Server.Addr)
		if err := s.Server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()

	waitStopSignal()
	ctx, cancel := context.WithTimeout(context.Background(), s.cfg.ShutdownTimeout)
	defer cancel()
	if err := s.Server.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}
	log.Info("server exiting")
}

func waitStopSignal() {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
}

type ServerOption func(*ServerConfig)

func WithPort(port int) ServerOption {
	return func(c *ServerConfig) { c.Port = port }
}

func WithHost(host string) ServerOption {
	return func(c *ServerConfig) { c.Host = host }
}

func WithShutdownTimeout(timeout time.Duration) ServerOption {
	return func(c *ServerConfig) { c.ShutdownTimeout = timeout }
}

func WithDefaultMiddlewares(ms ...gin.HandlerFunc) ServerOption {
	return func(c *ServerConfig) { c.DefaultMiddlewares = ms }
}

func WithExtMiddlewares(ms ...gin.HandlerFunc) ServerOption {
	return func(c *ServerConfig) { c.ExtMiddlewares = ms }
}

func WithDisableValidation(disable bool) ServerOption {
	return func(c *ServerConfig) { c.DisableValidation = disable }
}

package gx

import (
	"bytes"
	"encoding/json"
	"io"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/pkg/ec"
	"github.com/xichan96/cortex-lab/pkg/log"
	"github.com/xichan96/cortex-lab/pkg/std/cmath"
	"github.com/xichan96/cortex-lab/pkg/std/str"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
)

type LoggerMod func(*LoggerOption)

type LoggerOption struct {
	DisableBody      bool
	MaxBodySize      int64
	SkipStatus       map[int]struct{}
	SkipPaths        map[string]struct{}
	SkipPathPatterns []string
	Logger           log.CLogger
}

func WithDisableBody(b bool) LoggerMod {
	return func(op *LoggerOption) { op.DisableBody = b }
}

func WithMaxBodySize(size int64) LoggerMod {
	return func(op *LoggerOption) { op.MaxBodySize = size }
}

func WithSkipStatus(s ...int) LoggerMod {
	return func(op *LoggerOption) {
		op.SkipStatus = make(map[int]struct{}, len(s))
		for _, i := range s {
			op.SkipStatus[i] = struct{}{}
		}
	}
}

func WithSkipPaths(paths ...string) LoggerMod {
	return func(op *LoggerOption) {
		op.SkipPaths = make(map[string]struct{}, len(paths))
		for _, p := range paths {
			op.SkipPaths[p] = struct{}{}
		}
	}
}

func WithSkipPathPatterns(paths ...string) LoggerMod {
	return func(op *LoggerOption) { op.SkipPathPatterns = paths }
}

func WithLogger(l log.CLogger) LoggerMod {
	return func(op *LoggerOption) {
		if l != nil {
			op.Logger = l
		}
	}
}

type requestLog struct {
	Host      string        `json:"host"`
	URI       string        `json:"uri"`
	Method    string        `json:"method"`
	RequestID string        `json:"request_id"`
	Status    int           `json:"status"`
	RemoteIP  string        `json:"remote_ip"`
	Referer   string        `json:"referer"`
	Latency   float64       `json:"latency"`
	Code      *ec.ErrorCode `json:"code"`
	Body      string        `json:"body"`
}

const noLoggingKey = "__nologger"

var logOpts = []log.ModOptions{log.WithDisableHTMLEscape(true), log.WithDisableCaller(true)}

func Logger(fns ...LoggerMod) gin.HandlerFunc {
	op := LoggerOption{MaxBodySize: 1000}
	for _, fn := range fns {
		fn(&op)
	}

	if op.Logger == nil {
		op.Logger = log.NewLogger(logOpts...)
	}

	return func(c *gin.Context) {
		req := c.Request
		path := req.URL.Path
		isSkip := shouldSkipPath(path, op.SkipPaths, op.SkipPathPatterns)

		var body []byte
		if !isSkip && !op.DisableBody && req.ContentLength < op.MaxBodySize && req.Body != nil {
			body, _ = io.ReadAll(req.Body)
			req.Body = io.NopCloser(bytes.NewBuffer(body))
			if json.Valid(body) {
				buffer := new(bytes.Buffer)
				if err := json.Compact(buffer, body); err == nil {
					body = buffer.Bytes()
				}
			}
		}

		start := time.Now()
		c.Next()

		if _, ok := c.Get(noLoggingKey); ok || isSkip {
			return
		}
		if _, ok := op.SkipStatus[c.Writer.Status()]; ok {
			return
		}

		logger := op.Logger
		if username := cctx.GetUsername(c); len(username) > 0 {
			logger = logger.WithUserID(username)
		}

		logger.WithJSON().Info(requestLog{
			Host:      req.Host,
			URI:       req.RequestURI,
			Method:    req.Method,
			RequestID: cctx.GetRequestID(c),
			Status:    c.Writer.Status(),
			RemoteIP:  c.RemoteIP(),
			Referer:   req.Referer(),
			Latency:   cmath.RoundFloat(time.Since(start).Seconds(), 3),
			Code:      cctx.GetErrCode(c),
			Body:      str.UnsafeString(body),
		})
	}
}

func shouldSkipPath(path string, skipPaths map[string]struct{}, patterns []string) bool {
	if len(skipPaths) > 0 {
		if _, ok := skipPaths[path]; ok {
			return true
		}
	}
	for _, p := range patterns {
		if ok, _ := regexp.MatchString(p, path); ok {
			return true
		}
	}
	return false
}

func NoLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(noLoggingKey, struct{}{})
	}
}

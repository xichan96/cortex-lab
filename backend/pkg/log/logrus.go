package log

import (
	"bytes"
	"encoding/json"
	"io"
	"os"

	"github.com/natefinch/lumberjack"
	"github.com/sirupsen/logrus"
)

const (
	fieldKeys  = "__fields"
	JSONMsg    = "__json_flag"
	prettyJSON = "__pretty_flag"
	optionsKey = "__options"
)

func newLogger(opt Options) *Logger {
	l := logrus.New()
	level, _ := logrus.ParseLevel(opt.Level)
	l.SetLevel(level)
	l.SetReportCaller(true)
	if opt.FormatType == JSONFormat {
		l.SetFormatter(&JSONFormatter{})
	} else {
		l.SetFormatter(&CCFormatter{})
	}
	writers := make([]io.Writer, 0, 2)

	if opt.EnableFile {
		writer := &lumberjack.Logger{
			Filename:   opt.FileName,
			MaxSize:    opt.FileMaxSize,
			MaxAge:     opt.FileMaxAge,
			MaxBackups: opt.FileMaxBackups,
			LocalTime:  true,
		}
		writers = append(writers, writer)
	}

	if !opt.DisableConsole || !opt.EnableFile {
		writers = append(writers, os.Stdout)
	}

	l.SetOutput(io.MultiWriter(writers...))

	entry := logrus.NewEntry(l)
	entry.Data[fieldKeys] = make([]map[string]interface{}, 0)
	entry.Data[optionsKey] = opt
	return &Logger{
		entry: entry,
		opt:   opt,
	}
}

type Logger struct {
	entry *logrus.Entry
	opt   Options
}

func (logger *Logger) WithField(key string, val any) CLogger {
	rawData, _ := logger.entry.Data[fieldKeys].([]map[string]interface{})
	data := make([]map[string]interface{}, 0, len(rawData)+1)
	data = append(data, rawData...)
	data = append(data, map[string]interface{}{key: val})
	entry := logger.entry.WithField(fieldKeys, data)
	return &Logger{entry: entry, opt: logger.opt}
}

func (logger Logger) WithTraceID(traceID string) CLogger {
	logger.entry = logger.entry.WithField(logger.opt.TraceIDKey, traceID)
	return &logger
}

func (logger Logger) WithUserID(userID string) CLogger {
	logger.entry = logger.entry.WithField(logger.opt.UserIDKey, userID)
	return &logger
}

func (logger Logger) WithJSON() CLogger {
	logger.entry = logger.entry.WithField(JSONMsg, true)
	return &logger
}

func (logger Logger) WithPrettyJSON() CLogger {
	logger.entry = logger.entry.WithField(JSONMsg, true).WithField(prettyJSON, true)
	return &logger
}

func (logger Logger) WithDisableCaller(b bool) CLogger {
	return logger.withOptions(func(op *Options) {
		op.DisableCaller = b
	})
}

func (logger Logger) withOptions(fn ModOptions) CLogger {
	fn(&logger.opt)
	logger.entry = logger.entry.WithField(optionsKey, logger.opt)
	return &logger
}

func (logger *Logger) log(level func(...any), levelf func(string, ...any), args ...any) {
	if msg, ok := logger.isJSONMsg(args...); ok {
		levelf("%s", msg)
		return
	}
	level(args...)
}

func (logger *Logger) Debug(args ...any) {
	logger.log(logger.entry.Debug, logger.entry.Debugf, args...)
}

func (logger *Logger) Info(args ...any) {
	logger.log(logger.entry.Info, logger.entry.Infof, args...)
}

func (logger *Logger) Warn(args ...any) {
	logger.log(logger.entry.Warn, logger.entry.Warnf, args...)
}

func (logger *Logger) Error(args ...any) {
	logger.log(logger.entry.Error, logger.entry.Errorf, args...)
}

func (logger *Logger) Fatal(args ...any) {
	logger.log(logger.entry.Fatal, logger.entry.Fatalf, args...)
}

func (logger *Logger) Panic(args ...any) {
	logger.log(logger.entry.Panic, logger.entry.Panicf, args...)
}

func (logger *Logger) Debugf(format string, args ...any) {
	logger.entry.Debugf(format, args...)
}

func (logger *Logger) Infof(format string, args ...any) {
	logger.entry.Infof(format, args...)
}

func (logger *Logger) Warnf(format string, args ...any) {
	logger.entry.Warnf(format, args...)
}

func (logger *Logger) Errorf(format string, args ...any) {
	logger.entry.Errorf(format, args...)
}

func (logger *Logger) Fatalf(format string, args ...any) {
	logger.entry.Fatalf(format, args...)
}

func (logger *Logger) Panicf(format string, args ...any) {
	logger.entry.Panicf(format, args...)
}

func (logger *Logger) Println(args ...any) {
	logger.entry.Println(args...)
}

func (logger *Logger) Printf(format string, args ...any) {
	logger.entry.Printf(format, args...)
}

func (logger *Logger) isJSONMsg(args ...any) ([]byte, bool) {
	if logger.opt.FormatType != JSONFormat && len(args) != 1 || !logger.hasJSONFlag() {
		return nil, false
	}

	b := &bytes.Buffer{}
	encoder := json.NewEncoder(b)
	encoder.SetEscapeHTML(!logger.opt.DisableHTMLEscape)
	if logger.hasPrettyJSON() {
		b.WriteByte('\n')
		encoder.SetIndent("", "  ")
	}
	if err := encoder.Encode(args[0]); err != nil {
		return nil, false
	}
	return b.Bytes()[:len(b.Bytes())-1], true
}

func (logger *Logger) hasJSONFlag() bool {
	flag, ok := logger.entry.Data[JSONMsg]
	if !ok {
		return false
	}
	f, ok := flag.(bool)
	return ok && f
}

func (logger *Logger) hasPrettyJSON() bool {
	flag, ok := logger.entry.Data[prettyJSON]
	if !ok {
		return false
	}
	f, ok := flag.(bool)
	return ok && f
}

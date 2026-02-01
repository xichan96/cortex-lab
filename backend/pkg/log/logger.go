package log

type CLogger interface {
	Debug(args ...any)
	Info(args ...any)
	Warn(args ...any)
	Error(args ...any)
	Fatal(args ...any)
	Panic(args ...any)
	Debugf(format string, args ...any)
	Infof(format string, args ...any)
	Warnf(format string, args ...any)
	Errorf(format string, args ...any)
	Fatalf(format string, args ...any)
	Panicf(format string, args ...any)
	Println(args ...any)
	Printf(format string, args ...any)

	WithField(key string, val any) CLogger
	WithTraceID(trace string) CLogger
	WithUserID(userID string) CLogger
	WithDisableCaller(b bool) CLogger
	WithJSON() CLogger
	WithPrettyJSON() CLogger
}

func NewLogger(fn ...ModOptions) CLogger {
	var op Options
	for _, f := range fn {
		f(&op)
	}

	if op.EnableFile {
		if len(op.FileName) == 0 {
			op.FileName = defaultFileName
		}
		if op.FileMaxSize <= 0 || op.FileMaxSize > maxFileSize {
			op.FileMaxSize = defaultFileSize
		}
		if op.FileMaxAge <= 0 || op.FileMaxAge > maxFileAge {
			op.FileMaxAge = defaultFileAge
		}
		if op.FileMaxBackups <= 0 || op.FileMaxBackups > maxFileBackups {
			op.FileMaxBackups = defaultFileBackups
		}
	}

	if len(op.Level) == 0 {
		op.Level = defaultLevel
	}
	if len(op.LevelKey) == 0 {
		op.LevelKey = defaultLevelKey
	}
	if len(op.TimeFormat) == 0 {
		op.TimeFormat = defaultTimeFormat
	}
	if len(op.TimeKey) == 0 {
		op.TimeKey = defaultTimeKey
	}
	if len(op.TraceIDKey) == 0 {
		op.TraceIDKey = defaultTraceIDKey
	}
	if len(op.UserIDKey) == 0 {
		op.UserIDKey = defaultUserIDKey
	}
	if !op.RemoveCaller && len(op.CallerKey) == 0 {
		op.CallerKey = defaultCallerKey
	}
	if !op.RemoveMsgKey && len(op.MsgKey) == 0 {
		op.MsgKey = defaultMsgKey
	}
	if op.FormatType != JSONFormat {
		op.FormatType = CCFormat
	}

	return newLogger(op)
}

var (
	DefaultLogger = NewLogger()
	defaultOpts   = make([]ModOptions, 0)
	Debug         = DefaultLogger.Debug
	Debugf        = DefaultLogger.Debugf
	Info          = DefaultLogger.Info
	Infof         = DefaultLogger.Infof
	Warn          = DefaultLogger.Warn
	Warnf         = DefaultLogger.Warnf
	Error         = DefaultLogger.Error
	Errorf        = DefaultLogger.Errorf
	Fatal         = DefaultLogger.Fatal
	Fatalf        = DefaultLogger.Fatalf
)

func SetGlobal(fn ...ModOptions) {
	defaultOpts = append(defaultOpts, fn...)
	DefaultLogger = NewLogger(defaultOpts...)
	Debug = DefaultLogger.Debug
	Debugf = DefaultLogger.Debugf
	Info = DefaultLogger.Info
	Infof = DefaultLogger.Infof
	Warn = DefaultLogger.Warn
	Warnf = DefaultLogger.Warnf
	Error = DefaultLogger.Error
	Errorf = DefaultLogger.Errorf
	Fatal = DefaultLogger.Fatal
	Fatalf = DefaultLogger.Fatalf
}

func WithJSON() CLogger {
	return DefaultLogger.WithJSON()
}

func WithPrettyJSON() CLogger {
	return DefaultLogger.WithPrettyJSON()
}

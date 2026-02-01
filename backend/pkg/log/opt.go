package log

const (
	DebugLevel = "debug"
	InfoLevel  = "info"
	WarnLevel  = "warning"
	ErrorLevel = "error"
)

const (
	defaultFileName    = "log/app"
	defaultFileSize    = 100
	maxFileSize        = 1024
	defaultFileAge     = 7
	maxFileAge         = 365
	defaultFileBackups = 10
	maxFileBackups     = 1000

	defaultUserIDKey  = "user_id"
	defaultTraceIDKey = "trace_id"
	defaultCallerKey  = "caller"

	defaultLevel    = DebugLevel
	defaultLevelKey = "level"

	defaultTimeFormat = "2006-01-02T15:04:05.000+08:00"
	defaultTimeKey    = "time"

	defaultMsgKey = "msg"
)

const (
	JSONFormat = "json"
	CCFormat   = "cc"
)

type Options struct {
	FormatType string

	Level        string
	LevelKey     string
	DisableLevel bool
	RemoveLevel  bool

	TimeFormat  string
	TimeKey     string
	DisableTime bool
	RemoveTime  bool

	DisableCaller      bool
	RemoveCaller       bool
	CallerKey          string
	SkipCaller         int
	IgnoreCallerPrefix string
	EnableCallerMod    bool

	RemoveMsgKey bool
	MsgKey       string

	DisableConsole bool
	EnableFile     bool
	FileName       string
	FileMaxSize    int
	FileMaxBackups int
	FileMaxAge     int

	DisableHTMLEscape bool
	EnablePrettyJson  bool

	UserIDKey    string
	RemoveUserID bool

	TraceIDKey    string
	RemoveTraceID bool

	RemoveReserved bool
}

type ModOptions func(*Options)

func withBool(fn func(*Options, bool)) func(bool) ModOptions {
	return func(b bool) ModOptions {
		return func(o *Options) { fn(o, b) }
	}
}

func withString(fn func(*Options, string)) func(string) ModOptions {
	return func(s string) ModOptions {
		return func(o *Options) { fn(o, s) }
	}
}

func withInt(fn func(*Options, int)) func(int) ModOptions {
	return func(i int) ModOptions {
		return func(o *Options) { fn(o, i) }
	}
}

var (
	WithEnableFile        = withBool(func(o *Options, b bool) { o.EnableFile = b })
	WithRemoveTime        = withBool(func(o *Options, b bool) { o.RemoveTime = b })
	WithDisableTime       = withBool(func(o *Options, b bool) { o.DisableTime = b })
	WithRemoveUserID      = withBool(func(o *Options, b bool) { o.RemoveUserID = b })
	WithRemoveTraceID     = withBool(func(o *Options, b bool) { o.RemoveTraceID = b })
	WithRemoveLevel       = withBool(func(o *Options, b bool) { o.RemoveLevel = b })
	WithDisableLevel      = withBool(func(o *Options, b bool) { o.DisableLevel = b })
	WithRemoveCaller      = withBool(func(o *Options, b bool) { o.RemoveCaller = b })
	WithDisableCaller     = withBool(func(o *Options, b bool) { o.DisableCaller = b })
	WithDisableConsole    = withBool(func(o *Options, b bool) { o.DisableConsole = b })
	WithRemoveMsgKey      = withBool(func(o *Options, b bool) { o.RemoveMsgKey = b })
	WithEnablePrettyJson  = withBool(func(o *Options, b bool) { o.EnablePrettyJson = b })
	WithDisableHTMLEscape = withBool(func(o *Options, b bool) { o.DisableHTMLEscape = b })
	WithRemoveReserved    = withBool(func(o *Options, b bool) { o.RemoveReserved = b })
	WithEnableCallerMod   = withBool(func(o *Options, b bool) { o.EnableCallerMod = b })
)

var (
	WithFilename           = withString(func(o *Options, s string) { o.FileName = s })
	WithTimeKey            = withString(func(o *Options, s string) { o.TimeKey = s })
	WithTimeFormat         = withString(func(o *Options, s string) { o.TimeFormat = s })
	WithUseIDKey           = withString(func(o *Options, s string) { o.UserIDKey = s })
	WithTraceIDKey         = withString(func(o *Options, s string) { o.TraceIDKey = s })
	WithLevelKey           = withString(func(o *Options, s string) { o.LevelKey = s })
	WithLevel              = withString(func(o *Options, s string) { o.Level = s })
	WithCallerKey          = withString(func(o *Options, s string) { o.CallerKey = s })
	WithMsgKey             = withString(func(o *Options, s string) { o.MsgKey = s })
	WithFormatType         = withString(func(o *Options, s string) { o.FormatType = s })
	WithIgnoreCallerPrefix = withString(func(o *Options, s string) { o.IgnoreCallerPrefix = s })
)

var (
	WithFileMaxSize    = withInt(func(o *Options, i int) { o.FileMaxSize = i })
	WithFileMaxAge     = withInt(func(o *Options, i int) { o.FileMaxAge = i })
	WithFileMaxBackups = withInt(func(o *Options, i int) { o.FileMaxBackups = i })
	WithSkipCaller     = withInt(func(o *Options, i int) { o.SkipCaller = i })
)

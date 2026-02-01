package log

import (
	"reflect"
	"testing"

	"github.com/sirupsen/logrus"
)

func pprint(l CLogger) {
	l.Debug("hello")
	l.Info("hello")
	l.Warn("hello")
	l.Error("hello")
}

func TestWithFile(t *testing.T) {
	if testing.Short() {
		t.Skip()
	}
	l := NewLogger(
		WithEnableFile(true),
		WithFileMaxBackups(10),
		WithFilename("log/test.log"),
		WithFileMaxSize(2),
		WithDisableConsole(true),
		//WithFileMaxAge()
	)
	for i := 0; i < 200; i++ {
		pprint(l)
	}
}

func TestWithJSONLog(t *testing.T) {
	l := NewLogger(WithFormatType(JSONFormat))
	pprint(l)
}

func TestWithTimeKey(t *testing.T) {
	l := NewLogger(
		WithFormatType(JSONFormat),
		WithTimeKey("ts"),
	)
	pprint(l)
}

func TestWithUserIDKey(t *testing.T) {
	l := NewLogger(
		WithFormatType(JSONFormat),
		WithUseIDKey("uuuuid"),
		WithTraceIDKey("tttttid"),
		WithCallerKey("ccccccler"),
		WithLevelKey("level_key"),
	)
	l.WithUserID("vuo").WithTraceID("word").Info("hell")
}

func TestLogger_WithField(t *testing.T) {
	l := NewLogger()
	l = l.WithField("a", 1).WithField("b", "c  ccc")
	l.Info("111")
	pprint(l)
}

func TestLogger_WithField_withJSON(t *testing.T) {
	l := NewLogger()
	l.WithPrettyJSON().Info(map[string]string{"1": "2"})
	l.WithJSON().Info(map[string]string{"1": "2"})
	l.Info(map[string]string{"1": "2"})
	l.WithField("a", 1).WithField("b", "c  ccc").Info(111)
	l.WithField("a", 1).WithField("b", "c  ccc").Info(111)

}

func TestLogger_WithPrettyJSON(t *testing.T) {
	l := NewLogger(WithEnablePrettyJson(true), WithFormatType(JSONFormat))
	l.Info("111")
}

func TestLogger_WithJSON(t *testing.T) {
	l := NewLogger(WithEnablePrettyJson(true), WithFormatType(JSONFormat), WithDisableHTMLEscape(true))
	l.Info("111&&&")
}

func TestLogger_WithField4(t *testing.T) {
	l := NewLogger()
	l.WithField("a", 1).WithField("b", "c  ccc").Info("111")
}

func TestLogger_WithField2(t *testing.T) {
	logrus.WithField("b", "cccccc   ccc").WithField("a", "b").Info("1 ")
}

type AS string

func TestWithIgnoreCallerPrefix(t *testing.T) {
	SetGlobal(WithIgnoreCallerPrefix("github.com/xichan96/cortex-lab"), WithFormatType(JSONFormat))
	Info("你好")
}

func TestLevel(t *testing.T) {
	Debug("111")
}

func TestWithCallerKey1(t *testing.T) {
	l := NewLogger(WithCallerKey("my-caller"))
	l.Debug("hello")
	l2 := NewLogger(WithFormatType(JSONFormat), WithCallerKey("my-caller"))
	l2.Debug("hello")
}

func TestWithDisableCaller1(t *testing.T) {
	l := NewLogger(WithDisableCaller(true))
	l.Debug("hello")
	l2 := NewLogger(WithFormatType(JSONFormat), WithDisableCaller(true))
	l2.Debug("hello")
}

func TestWithDisableConsole(t *testing.T) {
	// 这个测试要配合file
	l := NewLogger(WithDisableConsole(true))
	l.Debug("hello")
	l2 := NewLogger(WithFormatType(JSONFormat), WithDisableConsole(true))
	l2.Debug("hello")
}

func TestWithDisableHTMLEscape(t *testing.T) {
	type args struct {
		b bool
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithDisableHTMLEscape(tt.args.b); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithDisableHTMLEscape() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithRemoveTime(t *testing.T) {
	l := NewLogger(WithRemoveTime(true))
	l.Debug("hello")
	l2 := NewLogger(WithFormatType(JSONFormat), WithRemoveTime(true))
	l2.Debug("hello")
}

func TestWithDisableTime(t *testing.T) {
	l := NewLogger(WithDisableTime(true))
	l.Debug("hello")
	l2 := NewLogger(WithFormatType(JSONFormat), WithDisableTime(true))
	l2.Debug("hello")
}

func TestWithTimeKey1(t *testing.T) {
	l2 := NewLogger(WithFormatType(JSONFormat), WithTimeKey("my-time"))
	l2.Debug("hello")
}

func TestWithTimeFormat1(t *testing.T) {
	l := NewLogger(WithTimeFormat("2006/01/02"))
	l.Debug("hello")
	l2 := NewLogger(WithFormatType(JSONFormat), WithTimeFormat("2006/01/02"))
	l2.Debug("hello")
}

func TestWithRemoveUserID1(t *testing.T) {
	l1 := NewLogger(WithRemoveUserID(true))
	l1.WithUserID("vip").Debug("hello")
	l2 := NewLogger()
	l2.WithUserID("vip").Debug("hello")
}

func TestWithUseIDKey(t *testing.T) {
	l1 := NewLogger(WithFormatType(JSONFormat))
	l1.WithUserID("vip").Debug("hello")
	l2 := NewLogger(WithFormatType(JSONFormat), WithUseIDKey("username"))
	l2.WithUserID("vip").Debug("hello")
}

func TestWithRemoveTraceID1(t *testing.T) {
	l1 := NewLogger(WithRemoveTraceID(true))
	l1.WithTraceID("trace123").Debug("hello")
	l2 := NewLogger()
	l2.WithTraceID("trace123").Debug("hello")
}

func TestWithTraceIDKey(t *testing.T) {
	l1 := NewLogger(WithFormatType(JSONFormat))
	l1.WithTraceID("vip").Debug("hello")
	l2 := NewLogger(WithFormatType(JSONFormat), WithTraceIDKey("mytrace"))
	l2.WithTraceID("vip").Debug("hello")
}

func TestWithRemoveLevel(t *testing.T) {
	l11 := NewLogger()
	l11.Debug("hello")
	l12 := NewLogger(WithRemoveLevel(true))
	l12.Debug("hello")

	l21 := NewLogger(WithFormatType(JSONFormat))
	l21.Debug("hello")
	l22 := NewLogger(WithFormatType(JSONFormat), WithRemoveLevel(true))
	l22.Debug("hello")
}

func TestWithDisableLevel(t *testing.T) {
	l11 := NewLogger()
	l11.Debug("hello")
	l12 := NewLogger(WithDisableLevel(true))
	l12.Debug("hello")

	l21 := NewLogger(WithFormatType(JSONFormat))
	l21.Debug("hello")
	l22 := NewLogger(WithFormatType(JSONFormat), WithDisableLevel(true))
	l22.Debug("hello")
}

func TestWithLevel1(t *testing.T) {
	l10 := NewLogger(WithLevel(DebugLevel))
	pprint(l10)
	l11 := NewLogger(WithLevel(InfoLevel))
	pprint(l11)
	l12 := NewLogger(WithLevel(WarnLevel))
	pprint(l12)
	l13 := NewLogger(WithLevel(ErrorLevel))
	pprint(l13)

	l20 := NewLogger(WithFormatType(JSONFormat), WithLevel(DebugLevel))
	pprint(l20)
	l21 := NewLogger(WithFormatType(JSONFormat), WithLevel(InfoLevel))
	pprint(l21)
	l22 := NewLogger(WithFormatType(JSONFormat), WithLevel(WarnLevel))
	pprint(l22)
	l23 := NewLogger(WithFormatType(JSONFormat), WithLevel(ErrorLevel))
	pprint(l23)
}

func TestWithLevelKey(t *testing.T) {
	l21 := NewLogger(WithFormatType(JSONFormat))
	l21.Debug("hello")
	l22 := NewLogger(WithFormatType(JSONFormat), WithLevelKey("my-level"))
	l22.Debug("hello")
}

func TestWithRemoveCaller(t *testing.T) {
	l11 := NewLogger()
	l11.Debug("hello")
	l12 := NewLogger(WithRemoveCaller(true))
	l12.Debug("hello")

	l21 := NewLogger(WithFormatType(JSONFormat))
	l21.Debug("hello")
	l22 := NewLogger(WithFormatType(JSONFormat), WithRemoveCaller(true))
	l22.Debug("hello")
}

func TestWithDisableCaller(t *testing.T) {
	l11 := NewLogger()
	l11.Debug("hello")
	l12 := NewLogger(WithDisableCaller(true))
	l12.Debug("hello")

	l21 := NewLogger(WithFormatType(JSONFormat))
	l21.Debug("hello")
	l22 := NewLogger(WithFormatType(JSONFormat), WithDisableCaller(true))
	l22.Debug("hello")
}

func TestWithSkipCaller1(t *testing.T) {
	l11 := NewLogger()
	l11.Debug("hello")
	l12 := NewLogger(WithSkipCaller(1))
	d := l12.Debug
	d("hello")

}

func TestWithEnableCallerMod(t *testing.T) {

}

func TestWithEnableFile(t *testing.T) {
	type args struct {
		b bool
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithEnableFile(tt.args.b); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithEnableFile() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithEnablePrettyJson(t *testing.T) {
	type args struct {
		b bool
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithEnablePrettyJson(tt.args.b); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithEnablePrettyJson() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithFileMaxAge(t *testing.T) {
	type args struct {
		age int
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithFileMaxAge(tt.args.age); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithFileMaxAge() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithFileMaxBackups(t *testing.T) {
	type args struct {
		backups int
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithFileMaxBackups(tt.args.backups); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithFileMaxBackups() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithFileMaxSize(t *testing.T) {
	type args struct {
		s int
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithFileMaxSize(tt.args.s); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithFileMaxSize() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithFilename(t *testing.T) {
	type args struct {
		key string
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithFilename(tt.args.key); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithFilename() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithFormatType(t *testing.T) {
	type args struct {
		ty string
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithFormatType(tt.args.ty); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithFormatType() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithIgnoreCallerPrefix1(t *testing.T) {
	type args struct {
		prefix string
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithIgnoreCallerPrefix(tt.args.prefix); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithIgnoreCallerPrefix() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithMsgKey1(t *testing.T) {
	type args struct {
		key string
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithMsgKey(tt.args.key); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithMsgKey() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithRemoveMsgKey(t *testing.T) {
	type args struct {
		b bool
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithRemoveMsgKey(tt.args.b); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithRemoveMsgKey() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithRemoveReserved(t *testing.T) {
	type args struct {
		b bool
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithRemoveReserved(tt.args.b); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithRemoveReserved() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithRemoveTraceID(t *testing.T) {
	type args struct {
		b bool
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithRemoveTraceID(tt.args.b); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithRemoveTraceID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestWithRemoveUserID(t *testing.T) {
	type args struct {
		b bool
	}
	tests := []struct {
		name string
		args args
		want ModOptions
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := WithRemoveUserID(tt.args.b); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("WithRemoveUserID() = %v, want %v", got, tt.want)
			}
		})
	}
}

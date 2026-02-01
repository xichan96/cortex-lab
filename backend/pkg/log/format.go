package log

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/sirupsen/logrus"
)

func getEntryOption(entry *logrus.Entry) Options {
	if v, ok := entry.Data[optionsKey]; ok {
		return v.(Options)
	}
	return Options{}
}

const ccDefaultWord = "-"

type JSONFormatter struct{}

func (c JSONFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	data := make(map[string]interface{}, len(entry.Data)+4)

	for _, kv := range entry.Data[fieldKeys].([]map[string]interface{}) {
		for k, v := range kv {
			if err, ok := v.(error); ok {
				data[k] = err.Error()
			} else {
				data[k] = v
			}
		}
	}

	opt := getEntryOption(entry)

	if !opt.RemoveTime {
		data[opt.TimeKey] = ""
		if !opt.DisableTime {
			data[opt.TimeKey] = entry.Time.Format(opt.TimeFormat)
		}
	}

	if !opt.RemoveLevel {
		data[opt.LevelKey] = ""
		if !opt.DisableLevel {
			data[opt.LevelKey] = entry.Level
		}
	}

	data[opt.MsgKey] = entry.Message
	if !opt.RemoveCaller {
		var caller string
		if !opt.DisableCaller {
			caller = getCaller(entry.Caller, opt.SkipCaller)
			if len(opt.IgnoreCallerPrefix) > 0 {
				caller = strings.TrimPrefix(caller, opt.IgnoreCallerPrefix)
			}
		}
		data[opt.CallerKey] = caller
	}

	if u, ok := entry.Data[opt.UserIDKey]; ok {
		data[opt.UserIDKey] = u
	}
	if t, ok := entry.Data[opt.TraceIDKey]; ok {
		data[opt.TraceIDKey] = t
	}

	b := &bytes.Buffer{}
	encoder := json.NewEncoder(b)
	encoder.SetEscapeHTML(!opt.DisableHTMLEscape)
	if opt.EnablePrettyJson {
		encoder.SetIndent("", "  ")
	}
	if err := encoder.Encode(data); err != nil {
		return nil, err
	}

	return b.Bytes(), nil
}

type CCFormatter struct{}

func getFieldData(entry *logrus.Entry, field string) string {
	if u, ok := entry.Data[field]; ok {
		if us, sok := u.(string); sok && len(us) > 0 {
			return us
		}
	}
	return ccDefaultWord
}

func (c CCFormatter) fill(remove, disable bool, fn func() string) string {
	if remove {
		return ""
	}
	if disable {
		return "[-]"
	}
	return fmt.Sprintf("[%s]", fn())
}

type entryOption func(entry *logrus.Entry, opt Options) string

func (c CCFormatter) GetTime(entry *logrus.Entry, opt Options) string {
	return c.fill(opt.RemoveTime, opt.DisableTime, func() string {
		return entry.Time.Format(opt.TimeFormat)
	})
}

func (c CCFormatter) GetCaller(entry *logrus.Entry, opt Options) string {
	return c.fill(opt.RemoveCaller, opt.DisableCaller, func() string {
		caller := getCaller(entry.Caller, opt.SkipCaller)
		if len(opt.IgnoreCallerPrefix) > 0 {
			caller = strings.TrimPrefix(caller, opt.IgnoreCallerPrefix)
		}
		return caller
	})
}

func (c CCFormatter) GetReserved(entry *logrus.Entry, opt Options) string {
	return c.fill(opt.RemoveReserved, true, func() string { return "" })
}

func (c CCFormatter) GetTraceID(entry *logrus.Entry, opt Options) string {
	return c.fill(opt.RemoveTraceID, false, func() string {
		return getFieldData(entry, opt.TraceIDKey)
	})
}

func (c CCFormatter) GetUserID(entry *logrus.Entry, opt Options) string {
	return c.fill(opt.RemoveUserID, false, func() string {
		return getFieldData(entry, opt.UserIDKey)
	})
}

func (c CCFormatter) GetLevel(entry *logrus.Entry, opt Options) string {
	return c.fill(opt.RemoveLevel, opt.DisableLevel, entry.Level.String)
}

func (c CCFormatter) getFieldValue(entry *logrus.Entry, opt Options, remove, disable bool, key string) string {
	return c.fill(remove, disable, func() string {
		return getFieldData(entry, key)
	})
}

func (c CCFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	b := &bytes.Buffer{}
	opt := getEntryOption(entry)
	for _, fn := range []entryOption{c.GetTime, c.GetTraceID, c.GetReserved, c.GetUserID, c.GetLevel, c.GetCaller} {
		b.WriteString(fn(entry, opt))
	}

	for _, kv := range entry.Data[fieldKeys].([]map[string]interface{}) {
		for k, v := range kv {
			if err, ok := v.(error); ok {
				v = err.Error()
			}
			b.WriteString(k)
			b.WriteString("=")
			b.WriteString(fmt.Sprintf("%v ", v))
		}
	}

	if !opt.RemoveMsgKey {
		b.WriteString(opt.MsgKey)
		b.WriteString("=")
	}
	b.WriteString(entry.Message)
	b.WriteString("\n")

	return b.Bytes(), nil
}

package log

import (
	"bytes"
	"runtime"
	"strconv"
	"strings"
)

const (
	localPkg = "wheel/log"
	logPkg   = "sirupsen/logrus"
)

func isLocalFunc(funcName string) bool {
	return strings.Contains(funcName, localPkg) || strings.Contains(funcName, logPkg)
}

func isTest(filename string) bool {
	return strings.HasSuffix(filename, "_test.go")
}

func getCaller(frame *runtime.Frame, skip int) string {
	if isLocalFunc(frame.Function) {
		if fr := nextFrame(skip); fr != nil {
			frame = fr
		}
	}
	var buf bytes.Buffer
	fs := strings.Split(frame.File, "/")
	fus := strings.Split(frame.Function, "/")
	if len(fus) != 1 {
		lastFus := strings.Split(fus[len(fus)-1], ".")
		for i := 0; i < len(fus)-1; i++ {
			buf.WriteString(fus[i])
			buf.WriteByte('/')
		}
		if strings.HasSuffix(lastFus[0], "_test") && len(fs) >= 2 && fs[len(fs)-2] != lastFus[0] {
			buf.WriteString(fs[len(fs)-2])
		} else {
			buf.WriteString(lastFus[0])
		}
		buf.WriteByte('/')
	}
	buf.WriteString(fs[len(fs)-1])
	buf.WriteByte(':')
	buf.WriteString(strconv.Itoa(frame.Line))
	return buf.String()
}

func nextFrame(skip int) *runtime.Frame {
	const depth = 32
	var pcs [depth]uintptr
	_ = runtime.Callers(9, pcs[:])
	callersFrames := runtime.CallersFrames(pcs[:])
	for {
		callerFrame, isMore := callersFrames.Next()
		if !isLocalFunc(callerFrame.Function) || isTest(callerFrame.File) {
			for i := 0; i < skip && isMore; i++ {
				callerFrame, isMore = callersFrames.Next()
			}
			return &callerFrame
		}
		if !isMore {
			break
		}
	}
	return nil
}

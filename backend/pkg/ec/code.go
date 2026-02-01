package ec

import (
	"fmt"
	"io"

	"github.com/pkg/errors"
)

const systemErrorStart = 50000

var (
	Success      = NewErrorCode(0, "ok")
	BadParams    = NewErrorCode(400, "bad params")
	Unauthorized = NewErrorCode(401, "unauthorized")
	Forbidden    = NewErrorCode(403, "forbidden")
	NoFound      = NewErrorCode(404, "no found")
	ExistedErr   = NewErrorCode(444, "Existed")
	UnknownErr   = NewErrorCode(500, "system error")
)

type ErrorCode struct {
	Code  int32  `json:"code"`
	Msg   string `json:"msg"`
	stack errors.StackTrace
	err   error
}

func (ec *ErrorCode) Cause() error {
	return ec.err
}

func (ec *ErrorCode) Error() string {
	return ec.Msg
}

func (ec *ErrorCode) ErrStack() errors.StackTrace {
	return ec.stack
}

func (ec *ErrorCode) IsSystemError() bool {
	return ec.Code >= systemErrorStart
}

func (ec ErrorCode) WithStack() *ErrorCode {
	return &ErrorCode{
		Code:  ec.Code,
		Msg:   ec.Msg,
		stack: ErrorCallers(3),
		err:   ec.err,
	}
}

func (ec *ErrorCode) Format(s fmt.State, verb rune) {
	switch verb {
	case 'v':
		if s.Flag('+') {
			io.WriteString(s, fmt.Sprintf("%s %d", ec.Msg, ec.Code))
			ec.stack.Format(s, verb)
			return
		}
		fallthrough
	case 's':
		io.WriteString(s, ec.Msg)
	case 'q':
		fmt.Fprintf(s, "%q", ec.Msg)
	}
}

func newBaseError(ms string) *baseError {
	return &baseError{msg: ms}
}

type baseError struct {
	msg string
}

func (e baseError) Error() string {
	return e.msg
}

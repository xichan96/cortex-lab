package ec

import (
	"errors"
	"fmt"
	"strings"
)

func wrapError(skip int, err error, msg string) *ErrorCode {
	e := &ErrorCode{
		Code: systemErrorStart,
		err:  err,
	}

	var errCode *ErrorCode
	if errors.As(err, &errCode) {
		e.Code = errCode.Code
	}

	if len(msg) > 0 {
		e.Msg = fmt.Sprintf("%s: %s", msg, err.Error())
	} else {
		e.Msg = err.Error()
	}

	tr, ok := err.(StackTracer)
	if !ok || len(tr.ErrStack()) == 0 {
		e.stack = ErrorCallers(4 + skip)
	} else {
		e.stack = tr.ErrStack()
	}
	return e
}

func New(ms string) *ErrorCode {
	return newErrorCode(ms)
}

func Errorf(format string, args ...interface{}) error {
	return newErrorCode(fmt.Sprintf(format, args...))
}

func newErrorCode(ms string) *ErrorCode {
	return &ErrorCode{
		Code: systemErrorStart,
		Msg:  ms,
		err:  newBaseError(ms),
	}
}

func NewErrorCode(code int32, ms string) *ErrorCode {
	return &ErrorCode{
		Code: code,
		Msg:  ms,
		err:  newBaseError(ms),
	}
}

func Wrap(err error, ms ...string) *ErrorCode {
	return WrapWithSkip(1, err, ms...)
}

func Wrapf(err error, format string, args ...interface{}) *ErrorCode {
	return WrapWithSkip(1, err, fmt.Sprintf(format, args...))
}

func WrapWithSkip(skip int, err error, ms ...string) *ErrorCode {
	if err == nil {
		return nil
	}
	var msg string
	if len(ms) > 0 {
		msg = strings.Join(ms, " ")
	}
	return wrapError(skip, err, msg)
}

func Cause(err error) error {
	type causer interface {
		Cause() error
	}

	for err != nil {
		cause, ok := err.(causer)
		if !ok {
			break
		}
		err = cause.Cause()
	}
	return err
}

func IsErrCode(src error, dst *ErrorCode) bool {
	return IsErrCodeCode(src, dst.Code)
}

func IsErrCodeCode(src error, code int32) bool {
	var eCode *ErrorCode
	if !errors.As(src, &eCode) {
		return false
	}
	return eCode.Code == code
}

func IsErr(src, dst error) bool {
	return errors.Is(Cause(src), Cause(dst))
}

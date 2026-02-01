package gx

import (
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/xichan96/cortex-lab/pkg/ec"
	"github.com/xichan96/cortex-lab/pkg/log"
	"github.com/xichan96/cortex-lab/pkg/web"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
	"github.com/xichan96/cortex-lab/pkg/web/gx/validation"
)

func jsonResp(c *gin.Context, statusCode int, result *web.ResponseBody) {
	if result != nil {
		cctx.SetErrCode(c, result.ErrorCode)
	}
	c.JSON(statusCode, result)
}

func JSONSuccess(c *gin.Context, data interface{}) {
	jsonResp(c, http.StatusOK, &web.ResponseBody{
		Data:      data,
		ErrorCode: ec.Success,
	})
}

func JSONErr(c *gin.Context, err error, data ...interface{}) {
	JSONCodeErr(c, http.StatusOK, err, data...)
}

func JSONCodeErr(c *gin.Context, httpCode int, errS error, data ...interface{}) {
	var err *ec.ErrorCode
	if !errors.As(errS, &err) {
		err = ec.Wrap(errS)
	}

	result := &web.ResponseBody{ErrorCode: err}

	switch {
	case err.IsSystemError():
		ec.PrintStack(err)
		result.ErrorCode = ec.UnknownErr
		httpCode = http.StatusInternalServerError
	case ec.IsErrCode(err, ec.BadParams):
		httpCode = http.StatusBadRequest
	case ec.IsErrCode(err, ec.Unauthorized):
		httpCode = http.StatusUnauthorized
	case ec.IsErr(err, ec.Forbidden):
		httpCode = http.StatusForbidden
	}

	if len(data) > 0 {
		result.Data = data[0]
	}
	jsonResp(c, httpCode, result)
}

func BErr(err error) *ec.ErrorCode {
	var errs validator.ValidationErrors
	if !errors.As(err, &errs) {
		if !errors.Is(err, io.EOF) {
			log.Error(err)
		}
		return ec.BadParams
	}

	var msgs []string
	for _, v := range errs.Translate(validation.Tran()) {
		msgs = append(msgs, v)
	}

	return &ec.ErrorCode{
		Code: ec.BadParams.Code,
		Msg:  strings.Join(msgs, ";"),
	}
}

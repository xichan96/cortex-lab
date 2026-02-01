package validation

import (
	"fmt"
	"reflect"
	"regexp"

	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	nonstandard "github.com/go-playground/validator/v10/non-standard/validators"
)

type CustomValidation struct {
	Tag       string
	ZhMsg     string
	EnMsg     string
	Override  bool
	Func      func(fl validator.FieldLevel) bool
	translate func(trans ut.Translator, fe validator.FieldError) string
}

func defaultRegisterTranslator(tag string, msg string, override bool) validator.RegisterTranslationsFunc {
	return func(trans ut.Translator) error {
		return trans.Add(tag, msg, override)
	}
}

func defaultFieldTranslate(trans ut.Translator, fe validator.FieldError) string {
	return translateField(trans, fe.Tag(), fe.Field())
}

func defaultFieldParamTranslate(trans ut.Translator, fe validator.FieldError) string {
	return translateField(trans, fe.Tag(), fe.Field(), fe.Param())
}

func translateField(trans ut.Translator, tag string, field string, params ...string) string {
	var msg string
	var err error
	if len(params) > 0 {
		msg, err = trans.T(tag, field, params[0])
	} else {
		msg, err = trans.T(tag, field)
	}
	if err != nil {
		panic(fmt.Sprintf("translation error: %v", err))
	}
	return msg
}

var NotBlank = CustomValidation{
	Tag:       "notblank",
	ZhMsg:     "{0}不能全部为空",
	EnMsg:     "{0} must not all blank",
	Func:      nonstandard.NotBlank,
	translate: nil,
}

func CRegexValidFn(re string) func(validator.FieldLevel) bool {
	r := regexp.MustCompile(re)
	return func(fl validator.FieldLevel) bool {
		if fl.Field().Kind() == reflect.String {
			return r.MatchString(fl.Field().String())
		}
		panic(fmt.Sprintf("Bad field type %T", fl.Field().Interface()))
	}
}

func newRegexValidator(tag, zhMsg, enMsg, pattern string) CustomValidation {
	return CustomValidation{
		Tag:   tag,
		ZhMsg: zhMsg,
		EnMsg: enMsg,
		Func:  CRegexValidFn(pattern),
	}
}

var DefaultValidator = []CustomValidation{
	LowerVarValidator,
	UpperVarValidator,
	VarValidator,
	LowerIdentifierValidator,
	UpperIdentifier,
	Identifier,
	LowerSlugValidator,
	UpperSlugValidator,
	SlugValidator,
}

var (
	LowerVarValidator = newRegexValidator(
		"lvar",
		"{0}只允许有小写字母、数字和下划线，并且只能以小写字母或数字开头和结尾",
		"{0} contains only lowercase letter/number/underscore, and must not start or end with underscore",
		"^[0-9a-z][0-9a-z_]+[0-9a-z]$",
	)
	UpperVarValidator = newRegexValidator(
		"uvar",
		"{0}只允许有大写字母、数字和下划线，并且只能以大写字母或数字开头和结尾",
		"{0} contains only uppercase letter/number/underscore, and must not start or end with underscore",
		"^[0-9A-Z][0-9A-Z_]+[0-9A-Z]$",
	)
	VarValidator = newRegexValidator(
		"var",
		"{0}只允许有字母、数字和下划线，并且只能以字母或数字开头和结尾",
		"{0} contains only letter/number/underscore, and must not start or end with underscore",
		"^[0-9a-zA-Z][\\w]+[0-9a-zA-Z]$",
	)
	LowerIdentifierValidator = newRegexValidator(
		"lcid",
		"{0}只允许有小写字母、数字和连接符，并且只能以小写字母或数字开头和结尾",
		"{0} contains only lowercase letter/number/dash, and must not start or end with dash",
		"^[0-9a-z][0-9a-z-]+[0-9a-z]$",
	)
	UpperIdentifier = newRegexValidator(
		"ucid",
		"{0}只允许有大写字母、数字和连接符，并且只能以大写字母或数字开头和结尾",
		"{0} contains only uppercase letter/number/dash, and must not start or end with dash",
		"^[0-9A-Z][0-9A-Z-]+[0-9A-Z]$",
	)
	Identifier = newRegexValidator(
		"cid",
		"{0}只允许有字母、数字和连接符，并且只能以字母或数字开头和结尾",
		"{0} contains only letter/number/dash, and must not start or end with dash",
		"^[0-9a-zA-Z][0-9a-zA-Z-]+[0-9a-zA-Z]$",
	)
	LowerSlugValidator = newRegexValidator(
		"lslug",
		"{0}只允许有小写字母、数字、连接符和下划线，并且只能以小写字母或数字开头和结尾",
		"{0} contains only lowercase letter/number/dash/underscore, and must not start or end with dash/underscore",
		"^[0-9a-z][\\w-]+[0-9a-z]$",
	)
	UpperSlugValidator = newRegexValidator(
		"uslug",
		"{0}只允许有大写字母、数字、连接符和下划线，并且只能以大写字母或数字开头和结尾",
		"{0} contains only uppercase letter/number/dash/underscore, and must not start or end with dash/underscore",
		"^[0-9A-Z][\\w-]+[0-9A-Z]$",
	)
	SlugValidator = newRegexValidator(
		"slug",
		"{0}只允许有字母、数字、连接符和下划线，并且只能以字母或数字开头和结尾",
		"{0} contains letter/number/dash/underscore, and must not start or end with dash/underscore",
		"^[0-9a-zA-Z][\\w-]+[0-9a-zA-Z]$",
	)
)

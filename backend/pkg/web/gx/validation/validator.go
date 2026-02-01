package validation

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/locales/en"
	"github.com/go-playground/locales/zh"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	enTranslations "github.com/go-playground/validator/v10/translations/en"
	zhTranslations "github.com/go-playground/validator/v10/translations/zh"

	"github.com/xichan96/cortex-lab/pkg/log"
)

const (
	zhLocale = "zh"
	enLocale = "en"
)

var (
	trans         ut.Translator
	defaultLocale = zhLocale
)

func Tran() ut.Translator {
	return trans
}

func UseDefaultValidator() {
	UserJSONTagName()
	if err := RegisterTranslations(zhLocale); err != nil {
		log.Error(err)
	}
	if err := RegisterValidations(NotBlank); err != nil {
		log.Error(err)
	}
	if err := RegisterMissingTagTranslate(); err != nil {
		log.Error(err)
	}
}

func UserJSONTagName() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterTagNameFunc(func(fld reflect.StructField) string {
			name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
			if name == "-" {
				return ""
			}
			return name
		})
	}
}

func RegisterTranslations(locale string) error {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		zhT := zh.New()
		enT := en.New()
		uni := ut.New(enT, zhT, enT)

		var ok bool
		trans, ok = uni.GetTranslator(locale)
		if !ok {
			return fmt.Errorf("uni.GetTranslator(%s) failed", locale)
		}

		var err error
		switch locale {
		case "zh":
			err = zhTranslations.RegisterDefaultTranslations(v, trans)
		default:
			err = enTranslations.RegisterDefaultTranslations(v, trans)
		}
		defaultLocale = locale
		return err
	}
	return nil
}

func RegisterValidations(vrs ...CustomValidation) error {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		for _, vr := range vrs {
			if err := v.RegisterValidation(vr.Tag, vr.Func); err != nil {
				return err
			}
			if err := RegisterTranslation(v, vr); err != nil {
				return err
			}
		}
	}
	return nil
}

func RegisterTranslation(v *validator.Validate, vr CustomValidation) error {
	msg := vr.EnMsg
	if defaultLocale == zhLocale {
		msg = vr.ZhMsg
	}

	translate := vr.translate
	if translate == nil {
		translate = defaultFieldTranslate
	}
	if err := v.RegisterTranslation(
		vr.Tag, trans, defaultRegisterTranslator(vr.Tag, msg, vr.Override), translate,
	); err != nil {
		var t *ut.ErrConflictingTranslation
		if !errors.As(err, &t) {
			return err
		}
	}
	return nil
}

func RegisterMissingTagTranslate() error {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		missingTags := []CustomValidation{
			{Tag: "startswith", ZhMsg: "{0}必须以'{1}'开头", EnMsg: "{0} must start with'{1}'", translate: defaultFieldParamTranslate},
			{Tag: "startsnotwith", ZhMsg: "{0}不能以'{1}'开头", EnMsg: "{0} must not start with'{1}'", translate: defaultFieldParamTranslate},
			{Tag: "endswith", ZhMsg: "{0}必须以'{1}'结尾", EnMsg: "{0} must end with'{1}'", translate: defaultFieldParamTranslate},
			{Tag: "endsnotwith", ZhMsg: "{0}不能以'{1}'结尾", EnMsg: "{0} must not end with'{1}'", translate: defaultFieldParamTranslate},
		}
		for _, vr := range missingTags {
			if err := RegisterTranslation(v, vr); err != nil {
				return err
			}
		}
	}
	return nil
}

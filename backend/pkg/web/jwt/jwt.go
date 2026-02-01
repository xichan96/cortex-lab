package jwt

import (
	"encoding/json"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/xichan96/cortex-lab/pkg/ec"
	"github.com/xichan96/cortex-lab/pkg/log"
	"github.com/xichan96/cortex-lab/pkg/std/str"
)

const (
	defaultExpire = 3600 * 24
	defaultSecret = "prompt-hub"
	expKey        = "exp"
	dataKey       = "data"
	headerKey     = "X-JWT"
)

var (
	signExpiredErr = ec.New("token expired")
	signClaimsErr  = ec.New("invalid claims")
	signMethodErr  = ec.New("unexpected signed")
	defaultConfig  = &Config{
		Expire: defaultExpire,
		Secret: defaultSecret,
	}
	DefaultToken = NewToken(nil)
)

func NewToken(cfg *Config) *Token {
	if cfg == nil {
		cfg = defaultConfig
	}
	return &Token{cfg: cfg}
}

type Config struct {
	Expire int64
	Secret string
}

type Token struct {
	cfg *Config
}

func (t *Token) Encode(data any) (string, error) {
	bs, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	claims := jwt.MapClaims{
		expKey:  time.Now().Unix() + t.cfg.Expire,
		dataKey: str.UnsafeString(bs),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(t.cfg.Secret))
}

func (t *Token) DecodeBody(tk string, data any) error {
	raw, err := t.Decode(tk)
	if err != nil {
		return err
	}
	return json.Unmarshal(str.UnsafeBytes(raw), data)
}

func (t *Token) Decode(tk string) (string, error) {
	token, err := jwt.Parse(tk, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, signMethodErr
		}
		return []byte(t.cfg.Secret), nil
	}, jwt.WithoutClaimsValidation())
	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", signClaimsErr
	}
	if t.isExpire(claims) {
		return "", signExpiredErr
	}

	return claims[dataKey].(string), nil
}

func (t *Token) isExpire(claims jwt.MapClaims) bool {
	if t.cfg.Expire == 0 {
		return false
	}
	if v, ok := claims[expKey].(float64); ok {
		return time.Now().Unix() > int64(v)
	}
	return false
}

type httpHeader interface {
	Set(key, value string)
	Get(key string) string
}

func (t *Token) SetHTTPHeader(header httpHeader, data any) {
	tk, err := DefaultToken.Encode(data)
	if err != nil {
		log.Error(err)
		return
	}
	header.Set(headerKey, tk)
}

func (t *Token) WithHTTPHeader(data any) map[string]string {
	tk, err := DefaultToken.Encode(data)
	if err != nil {
		log.Error(err)
		return nil
	}
	return map[string]string{headerKey: tk}
}

func (t *Token) DecodeHTTPHeader(header httpHeader, data any) error {
	tk := header.Get(headerKey)
	if err := DefaultToken.DecodeBody(tk, data); err != nil {
		log.Error(err)
		return ec.Unauthorized
	}
	return nil
}

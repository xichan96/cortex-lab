package jwt

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestToken_isExpire(t *testing.T) {
	cfg := &Config{
		Expire: 3600, // 1 hour
		Secret: "test-secret",
	}
	token := NewToken(cfg)

	tests := []struct {
		name   string
		claims jwt.MapClaims
		want   bool
		desc   string
	}{
		{
			name: "Not Expired (Future)",
			claims: jwt.MapClaims{
				expKey: float64(time.Now().Add(time.Hour).Unix()),
			},
			want: false,
			desc: "Token expires in 1 hour, should not be expired",
		},
		{
			name: "Expired (Past - Just now)",
			claims: jwt.MapClaims{
				expKey: float64(time.Now().Add(-time.Second).Unix()), // Expired 1 second ago
			},
			want: true,
			desc: "Token expired 1 second ago, should be expired",
		},
		{
			name: "Expired (Past - Long ago)",
			claims: jwt.MapClaims{
				expKey: float64(time.Now().Add(-2 * time.Hour).Unix()), // Expired 2 hours ago
			},
			want: true,
			desc: "Token expired 2 hours ago, should be expired",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := token.isExpire(tt.claims)
			if got != tt.want {
				t.Errorf("%s: got %v, want %v", tt.desc, got, tt.want)
			}
		})
	}
}

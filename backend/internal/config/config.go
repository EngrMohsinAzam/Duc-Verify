package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	GinMode         string
	AppURL          string
	FrontendURL     string
	DBURL           string
	JWTSecret       string
	JWTExpiry       time.Duration
	S3Endpoint      string
	S3Bucket        string
	S3AccessKey     string
	S3SecretKey     string
	S3Region        string
	S3UseSSL        bool
	MaxUploadBytes  int64
	VerifyRateLimit float64
	VerifyRateBurst int
	AllowedOrigins  []string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		Port:            getEnv("PORT", "8080"),
		GinMode:         getEnv("GIN_MODE", "debug"),
		AppURL:          getEnv("APP_URL", "http://localhost:8080"),
		FrontendURL:     getEnv("FRONTEND_URL", "http://localhost:3000"),
		DBURL:           getEnv("DB_URL", ""),
		JWTSecret:       getEnv("JWT_SECRET", ""),
		S3Endpoint:      getEnv("S3_ENDPOINT", "http://localhost:9000"),
		S3Bucket:        getEnv("S3_BUCKET", "docverify"),
		S3AccessKey:     getEnv("S3_ACCESS_KEY", "minioadmin"),
		S3SecretKey:     getEnv("S3_SECRET_KEY", "minioadmin"),
		S3Region:        getEnv("S3_REGION", "us-east-1"),
		S3UseSSL:        getEnvBool("S3_USE_SSL", false),
		MaxUploadBytes:  int64(getEnvInt("MAX_UPLOAD_MB", 25)) * 1024 * 1024,
		VerifyRateLimit: float64(getEnvInt("VERIFY_RATE_LIMIT", 30)),
		VerifyRateBurst: getEnvInt("VERIFY_RATE_BURST", 10),
	}

	expiryHours := getEnvInt("JWT_EXPIRY_HOURS", 24)
	cfg.JWTExpiry = time.Duration(expiryHours) * time.Hour

	cfg.AllowedOrigins = parseOrigins(getEnv("ALLOWED_ORIGINS", ""))

	if cfg.DBURL == "" {
		return nil, fmt.Errorf("DB_URL is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	if len(cfg.JWTSecret) < 16 {
		return nil, fmt.Errorf("JWT_SECRET must be at least 16 characters")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return fallback
}

func parseOrigins(raw string) []string {
	if raw == "" {
		return nil
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if o := strings.TrimSpace(p); o != "" {
			out = append(out, o)
		}
	}
	return out
}

func (c *Config) CORSOrigins() []string {
	seen := map[string]struct{}{}
	var out []string
	add := func(o string) {
		o = strings.TrimRight(strings.TrimSpace(o), "/")
		if o == "" {
			return
		}
		if _, ok := seen[o]; ok {
			return
		}
		seen[o] = struct{}{}
		out = append(out, o)
	}
	add(c.FrontendURL)
	for _, o := range c.AllowedOrigins {
		add(o)
	}
	return out
}

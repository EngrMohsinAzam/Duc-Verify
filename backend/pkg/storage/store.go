package storage

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Store persists uploaded document files (S3 or PostgreSQL).
type Store interface {
	UploadDocument(ctx context.Context, orgID uuid.UUID, filename string, data []byte, contentType string) (key string, ref string, err error)
	DownloadFile(ctx context.Context, ref string) ([]byte, error)
	Ping(ctx context.Context) error
}

type Driver string

const (
	DriverS3 Driver = "s3"
	DriverDB Driver = "db"
)

func NewStore(ctx context.Context, driver Driver, db *gorm.DB, s3Cfg Config) (Store, error) {
	switch driver {
	case DriverDB:
		if db == nil {
			return nil, fmt.Errorf("database required for db storage")
		}
		return NewDBStorage(db), nil
	case DriverS3, "":
		return NewS3Storage(ctx, s3Cfg)
	default:
		return nil, fmt.Errorf("unknown storage driver: %q", driver)
	}
}

// RefToKey resolves a stored file reference to a storage key.
func RefToKey(ref, bucket string) string {
	ref = strings.TrimSpace(ref)
	if ref == "" {
		return ""
	}
	if strings.HasPrefix(ref, "documents/") {
		return ref
	}
	return KeyFromURL(ref, bucket)
}

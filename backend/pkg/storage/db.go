package storage

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type documentBlob struct {
	StorageKey  string    `gorm:"column:storage_key;primaryKey"`
	OrgID       uuid.UUID `gorm:"column:org_id;not null"`
	Data        []byte    `gorm:"column:data;not null"`
	ContentType string    `gorm:"column:content_type;not null"`
	CreatedAt   time.Time `gorm:"column:created_at"`
}

func (documentBlob) TableName() string { return "document_blobs" }

type DBStorage struct {
	db *gorm.DB
}

func NewDBStorage(db *gorm.DB) *DBStorage {
	return &DBStorage{db: db}
}

func (s *DBStorage) UploadDocument(ctx context.Context, orgID uuid.UUID, filename string, data []byte, contentType string) (string, string, error) {
	ext := ""
	if idx := strings.LastIndex(filename, "."); idx >= 0 {
		ext = filename[idx:]
	}
	key := fmt.Sprintf("documents/%s/%s%s", orgID.String(), uuid.NewString(), ext)
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	blob := documentBlob{
		StorageKey:  key,
		OrgID:       orgID,
		Data:        data,
		ContentType: contentType,
		CreatedAt:   time.Now().UTC(),
	}
	if err := s.db.WithContext(ctx).Create(&blob).Error; err != nil {
		return "", "", fmt.Errorf("save blob: %w", err)
	}

	return key, key, nil
}

func (s *DBStorage) DownloadFile(ctx context.Context, ref string) ([]byte, error) {
	key := RefToKey(ref, "")
	if key == "" {
		return nil, fmt.Errorf("invalid storage reference")
	}

	var blob documentBlob
	if err := s.db.WithContext(ctx).First(&blob, "storage_key = ?", key).Error; err != nil {
		return nil, fmt.Errorf("get blob: %w", err)
	}
	return blob.Data, nil
}

func (s *DBStorage) Ping(ctx context.Context) error {
	return s.db.WithContext(ctx).Raw("SELECT 1").Error
}

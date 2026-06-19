package audit

import (
	"context"

	"github.com/docverify/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Logger struct {
	db *gorm.DB
}

func NewLogger(db *gorm.DB) *Logger {
	return &Logger{db: db}
}

func (l *Logger) Log(ctx context.Context, orgID, docID *uuid.UUID, action, ip string) error {
	entry := models.AuditLog{
		OrgID:     orgID,
		DocID:     docID,
		Action:    action,
		IPAddress: ip,
	}
	return l.db.WithContext(ctx).Create(&entry).Error
}

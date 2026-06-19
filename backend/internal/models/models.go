package models

import (
	"time"

	"github.com/google/uuid"
)

const (
	DocStatusValid   = "valid"
	DocStatusRevoked = "revoked"
	DocStatusExpired = "expired"
)

const (
	AuditUploaded = "uploaded"
	AuditViewed   = "viewed"
	AuditRevoked  = "revoked"
)

type Organization struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string    `gorm:"size:255;not null" json:"name"`
	Email        string    `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"column:password_hash;size:255;not null" json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

func (Organization) TableName() string { return "organizations" }

type Document struct {
	ID            uuid.UUID     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ShortID       string        `gorm:"size:20;uniqueIndex;not null" json:"short_id"`
	OrgID         uuid.UUID     `gorm:"type:uuid;not null;index" json:"org_id"`
	Organization  *Organization `gorm:"foreignKey:OrgID" json:"organization,omitempty"`
	RecipientName string        `gorm:"size:255;not null" json:"recipient_name"`
	DocType       string        `gorm:"size:100" json:"doc_type"`
	SHA256Hash    string        `gorm:"column:sha256_hash;size:64;not null" json:"sha256_hash"`
	S3URL         string        `gorm:"column:s3_url;type:text;not null" json:"s3_url"`
	OriginalName  string        `gorm:"size:255" json:"original_name"`
	ContentType   string        `gorm:"size:100" json:"content_type"`
	FileSize      int64         `json:"file_size"`
	Status        string        `gorm:"size:20;default:valid;not null" json:"status"`
	IssuedAt      time.Time     `json:"issued_at"`
	ExpiresAt     *time.Time    `json:"expires_at,omitempty"`
	CreatedAt     time.Time     `json:"created_at"`
}

func (Document) TableName() string { return "documents" }

type AuditLog struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrgID     *uuid.UUID `gorm:"type:uuid;index" json:"org_id,omitempty"`
	DocID     *uuid.UUID `gorm:"type:uuid;index" json:"doc_id,omitempty"`
	Action    string     `gorm:"size:50;not null" json:"action"`
	IPAddress string     `gorm:"size:50" json:"ip_address,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

func (AuditLog) TableName() string { return "audit_logs" }

// EffectiveStatus returns revoked, expired, or valid based on stored status and expiry.
func (d *Document) EffectiveStatus(now time.Time) string {
	if d.Status == DocStatusRevoked {
		return DocStatusRevoked
	}
	if d.ExpiresAt != nil && now.After(*d.ExpiresAt) {
		return DocStatusExpired
	}
	return DocStatusValid
}

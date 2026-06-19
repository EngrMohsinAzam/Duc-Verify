package verify

import (
	"context"
	"errors"
	"time"

	"github.com/docverify/backend/internal/audit"
	"github.com/docverify/backend/internal/document"
	"github.com/docverify/backend/internal/models"
	"github.com/docverify/backend/pkg/storage"
	"gorm.io/gorm"
)

type Service struct {
	docRepo *document.Repository
	audit   *audit.Logger
	store   storage.Store
	bucket  string
}

func NewService(docRepo *document.Repository, auditLogger *audit.Logger, store storage.Store, bucket string) *Service {
	return &Service{
		docRepo: docRepo,
		audit:   auditLogger,
		store:   store,
		bucket:  bucket,
	}
}

type VerifyResponse struct {
	ShortID       string     `json:"short_id"`
	Status        string     `json:"status"`
	RecipientName string     `json:"recipient_name"`
	DocType       string     `json:"doc_type"`
	IssuerName    string     `json:"issuer_name"`
	IssuerEmail   string     `json:"issuer_email"`
	SHA256Hash    string     `json:"sha256_hash"`
	ContentType   string     `json:"content_type"`
	OriginalName  string     `json:"original_name"`
	IssuedAt      time.Time  `json:"issued_at"`
	ExpiresAt     *time.Time `json:"expires_at,omitempty"`
	VerifiedAt    time.Time  `json:"verified_at"`
}

type PreviewFile struct {
	Data        []byte
	ContentType string
	Filename    string
}

var ErrNotFound = errors.New("document not found")

func (s *Service) VerifyByShortID(ctx context.Context, shortID, ip string) (*VerifyResponse, error) {
	doc, err := s.docRepo.FindByShortID(ctx, shortID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	now := time.Now().UTC()
	status := doc.EffectiveStatus(now)

	if status == models.DocStatusExpired && doc.Status == models.DocStatusValid {
		_ = s.docRepo.MarkExpired(ctx, doc.ID)
		doc.Status = models.DocStatusExpired
	}

	orgID := doc.OrgID
	docID := doc.ID
	_ = s.audit.Log(ctx, &orgID, &docID, models.AuditViewed, ip)

	issuerName := ""
	issuerEmail := ""
	if doc.Organization != nil {
		issuerName = doc.Organization.Name
		issuerEmail = doc.Organization.Email
	}

	return &VerifyResponse{
		ShortID:       doc.ShortID,
		Status:        status,
		RecipientName: doc.RecipientName,
		DocType:       doc.DocType,
		IssuerName:    issuerName,
		IssuerEmail:   issuerEmail,
		SHA256Hash:    doc.SHA256Hash,
		ContentType:   doc.ContentType,
		OriginalName:  doc.OriginalName,
		IssuedAt:      doc.IssuedAt,
		ExpiresAt:     doc.ExpiresAt,
		VerifiedAt:    now,
	}, nil
}

func (s *Service) GetPreview(ctx context.Context, shortID string) (*PreviewFile, error) {
	doc, err := s.docRepo.FindByShortID(ctx, shortID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	data, err := s.store.DownloadFile(ctx, doc.S3URL)
	if err != nil {
		return nil, err
	}

	contentType := doc.ContentType
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	return &PreviewFile{
		Data:        data,
		ContentType: contentType,
		Filename:    doc.OriginalName,
	}, nil
}

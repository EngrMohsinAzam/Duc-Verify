package document

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"mime"
	"path/filepath"
	"strings"
	"time"

	"github.com/docverify/backend/internal/audit"
	"github.com/docverify/backend/internal/models"
	"github.com/docverify/backend/pkg/hasher"
	"github.com/docverify/backend/pkg/pdf"
	"github.com/docverify/backend/pkg/qr"
	"github.com/docverify/backend/pkg/shortid"
	"github.com/docverify/backend/pkg/storage"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrInvalidUpload   = errors.New("invalid upload")
	ErrFileTooLarge    = errors.New("file too large")
	ErrUnsupportedType = errors.New("unsupported file type")
	ErrAlreadyRevoked  = errors.New("document already revoked")
)

var allowedMIME = map[string]struct{}{
	"application/pdf":    {},
	"image/png":          {},
	"image/jpeg":         {},
	"application/msword": {},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {},
}

type Service struct {
	repo           *Repository
	storage        storage.Store
	audit          *audit.Logger
	frontendURL    string
	maxUploadBytes int64
}

func NewService(repo *Repository, store storage.Store, auditLogger *audit.Logger, frontendURL string, maxUploadBytes int64) *Service {
	return &Service{
		repo:           repo,
		storage:        store,
		audit:          auditLogger,
		frontendURL:    strings.TrimRight(frontendURL, "/"),
		maxUploadBytes: maxUploadBytes,
	}
}

type UploadInput struct {
	OrgID         uuid.UUID
	RecipientName string
	DocType       string
	ExpiresAt     *time.Time
	Filename      string
	ContentType   string
	File          io.Reader
	IP            string
}

type UploadResult struct {
	DocID        uuid.UUID `json:"doc_id"`
	ShortID      string    `json:"short_id"`
	QRCodeBase64 string    `json:"qr_code_base64"`
	SHA256Hash   string    `json:"sha256_hash"`
	VerifyURL    string    `json:"verify_url"`
}

func (s *Service) Upload(ctx context.Context, input UploadInput) (*UploadResult, error) {
	recipient := strings.TrimSpace(input.RecipientName)
	if recipient == "" || input.File == nil {
		return nil, ErrInvalidUpload
	}

	data, err := io.ReadAll(io.LimitReader(input.File, s.maxUploadBytes+1))
	if err != nil {
		return nil, fmt.Errorf("read file: %w", err)
	}
	if int64(len(data)) > s.maxUploadBytes {
		return nil, ErrFileTooLarge
	}
	if len(data) == 0 {
		return nil, ErrInvalidUpload
	}

	contentType := normalizeContentType(input.Filename, input.ContentType)
	if !isAllowedMIME(contentType) {
		return nil, ErrUnsupportedType
	}

	hash := hasher.HashFile(data)

	_, s3URL, err := s.storage.UploadDocument(ctx, input.OrgID, input.Filename, data, contentType)
	if err != nil {
		return nil, fmt.Errorf("upload s3: %w", err)
	}

	shortID, err := s.generateUniqueShortID(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	doc := &models.Document{
		ShortID:       shortID,
		OrgID:         input.OrgID,
		RecipientName: recipient,
		DocType:       strings.TrimSpace(input.DocType),
		SHA256Hash:    hash,
		S3URL:         s3URL,
		OriginalName:  filepath.Base(input.Filename),
		ContentType:   contentType,
		FileSize:      int64(len(data)),
		Status:        models.DocStatusValid,
		IssuedAt:      now,
		ExpiresAt:     input.ExpiresAt,
		CreatedAt:     now,
	}

	if err := s.repo.Create(ctx, doc); err != nil {
		return nil, fmt.Errorf("save document: %w", err)
	}

	verifyURL := fmt.Sprintf("%s/verify/%s", s.frontendURL, doc.ShortID)
	qrBytes, err := qr.GenerateQR(verifyURL, 256)
	if err != nil {
		return nil, fmt.Errorf("generate qr: %w", err)
	}

	orgID := input.OrgID
	docID := doc.ID
	_ = s.audit.Log(ctx, &orgID, &docID, models.AuditUploaded, input.IP)

	return &UploadResult{
		DocID:        doc.ID,
		ShortID:      doc.ShortID,
		QRCodeBase64: base64.StdEncoding.EncodeToString(qrBytes),
		SHA256Hash:   doc.SHA256Hash,
		VerifyURL:    verifyURL,
	}, nil
}

func (s *Service) List(ctx context.Context, filter ListFilter) ([]models.Document, int64, error) {
	docs, total, err := s.repo.ListByOrg(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	now := time.Now().UTC()
	for i := range docs {
		docs[i].Status = docs[i].EffectiveStatus(now)
	}
	return docs, total, nil
}

func (s *Service) GetByID(ctx context.Context, id, orgID uuid.UUID) (*models.Document, error) {
	doc, err := s.repo.FindByIDAndOrg(ctx, id, orgID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	doc.Status = doc.EffectiveStatus(time.Now().UTC())
	return doc, nil
}

func (s *Service) Revoke(ctx context.Context, id, orgID uuid.UUID, ip string) (*models.Document, error) {
	doc, err := s.repo.FindByIDAndOrg(ctx, id, orgID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	if doc.Status == models.DocStatusRevoked {
		return nil, ErrAlreadyRevoked
	}

	if err := s.repo.UpdateStatus(ctx, id, orgID, models.DocStatusRevoked); err != nil {
		return nil, err
	}

	doc.Status = models.DocStatusRevoked
	orgIDCopy := orgID
	docID := doc.ID
	_ = s.audit.Log(ctx, &orgIDCopy, &docID, models.AuditRevoked, ip)

	return doc, nil
}

func (s *Service) GeneratePDF(ctx context.Context, id, orgID uuid.UUID) ([]byte, string, error) {
	doc, err := s.GetByID(ctx, id, orgID)
	if err != nil {
		return nil, "", err
	}

	orgName := "Unknown Issuer"
	if doc.Organization != nil {
		orgName = doc.Organization.Name
	}

	verifyURL := fmt.Sprintf("%s/verify/%s", s.frontendURL, doc.ShortID)
	pdfBytes, err := pdf.GenerateCert(doc, orgName, verifyURL)
	if err != nil {
		return nil, "", err
	}

	filename := fmt.Sprintf("%s-certificate.pdf", doc.ShortID)
	return pdfBytes, filename, nil
}

func (s *Service) generateUniqueShortID(ctx context.Context) (string, error) {
	for i := 0; i < 10; i++ {
		id, err := shortid.Generate()
		if err != nil {
			return "", err
		}
		exists, err := s.repo.ShortIDExists(ctx, id)
		if err != nil {
			return "", err
		}
		if !exists {
			return id, nil
		}
	}
	return "", fmt.Errorf("failed to generate unique short id")
}

func normalizeContentType(filename, header string) string {
	if header != "" && header != "application/octet-stream" {
		return strings.Split(header, ";")[0]
	}
	ext := filepath.Ext(filename)
	if ct := mime.TypeByExtension(ext); ct != "" {
		return strings.Split(ct, ";")[0]
	}
	return "application/octet-stream"
}

func isAllowedMIME(ct string) bool {
	_, ok := allowedMIME[ct]
	return ok
}

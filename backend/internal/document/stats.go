package document

import (
	"context"
	"time"

	"github.com/docverify/backend/internal/audit"
	"github.com/docverify/backend/internal/models"
	"github.com/google/uuid"
)

type StatusCounts struct {
	Total   int64 `json:"total"`
	Valid   int64 `json:"valid"`
	Revoked int64 `json:"revoked"`
	Expired int64 `json:"expired"`
}

type DocTypeCount struct {
	DocType string `json:"doc_type"`
	Count   int64  `json:"count"`
}

type DashboardStats struct {
	TotalDocuments          int64              `json:"total_documents"`
	ValidDocuments          int64              `json:"valid_documents"`
	RevokedDocuments        int64              `json:"revoked_documents"`
	ExpiredDocuments        int64              `json:"expired_documents"`
	TotalVerifications      int64              `json:"total_verifications"`
	DocumentsLast30Days     int64              `json:"documents_last_30_days"`
	VerificationsLast30Days int64              `json:"verifications_last_30_days"`
	StorageUsedBytes        int64              `json:"storage_used_bytes"`
	VerificationTrend       []audit.TrendPoint `json:"verification_trend"`
	TopDocumentTypes        []DocTypeCount     `json:"top_document_types"`
	RecentActivity          []audit.ActivityItem `json:"recent_activity"`
	VerificationCounts      map[string]int64   `json:"verification_counts"`
}

func (r *Repository) CountByEffectiveStatus(ctx context.Context, orgID uuid.UUID) (*StatusCounts, error) {
	now := time.Now().UTC()

	var total int64
	if err := r.db.WithContext(ctx).Model(&models.Document{}).
		Where("org_id = ?", orgID).Count(&total).Error; err != nil {
		return nil, err
	}

	var revoked int64
	if err := r.db.WithContext(ctx).Model(&models.Document{}).
		Where("org_id = ? AND status = ?", orgID, models.DocStatusRevoked).
		Count(&revoked).Error; err != nil {
		return nil, err
	}

	var expired int64
	if err := r.db.WithContext(ctx).Model(&models.Document{}).
		Where("org_id = ? AND status != ? AND expires_at IS NOT NULL AND expires_at < ?",
			orgID, models.DocStatusRevoked, now).
		Count(&expired).Error; err != nil {
		return nil, err
	}

	valid := total - revoked - expired
	if valid < 0 {
		valid = 0
	}

	return &StatusCounts{
		Total:   total,
		Valid:   valid,
		Revoked: revoked,
		Expired: expired,
	}, nil
}

func (r *Repository) CountCreatedSince(ctx context.Context, orgID uuid.UUID, since time.Time) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Document{}).
		Where("org_id = ? AND created_at >= ?", orgID, since).
		Count(&count).Error
	return count, err
}

func (r *Repository) SumFileSize(ctx context.Context, orgID uuid.UUID) (int64, error) {
	var sum *int64
	err := r.db.WithContext(ctx).Model(&models.Document{}).
		Where("org_id = ?", orgID).
		Select("COALESCE(SUM(file_size), 0)").
		Scan(&sum).Error
	if err != nil {
		return 0, err
	}
	if sum == nil {
		return 0, nil
	}
	return *sum, nil
}

func (r *Repository) TopDocumentTypes(ctx context.Context, orgID uuid.UUID, limit int) ([]DocTypeCount, error) {
	if limit < 1 || limit > 20 {
		limit = 5
	}

	type row struct {
		DocType string
		Count   int64
	}
	var rows []row

	err := r.db.WithContext(ctx).Model(&models.Document{}).
		Select("COALESCE(NULLIF(TRIM(doc_type), ''), 'Official Document') as doc_type, COUNT(*) as count").
		Where("org_id = ?", orgID).
		Group("COALESCE(NULLIF(TRIM(doc_type), ''), 'Official Document')").
		Order("count DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make([]DocTypeCount, len(rows))
	for i, r := range rows {
		out[i] = DocTypeCount{DocType: r.DocType, Count: r.Count}
	}
	return out, nil
}

func (s *Service) DashboardStats(ctx context.Context, orgID uuid.UUID) (*DashboardStats, error) {
	counts, err := s.repo.CountByEffectiveStatus(ctx, orgID)
	if err != nil {
		return nil, err
	}

	since30 := time.Now().UTC().AddDate(0, 0, -30)

	docsLast30, err := s.repo.CountCreatedSince(ctx, orgID, since30)
	if err != nil {
		return nil, err
	}

	storage, err := s.repo.SumFileSize(ctx, orgID)
	if err != nil {
		return nil, err
	}

	totalVerifications, err := s.audit.CountByAction(ctx, orgID, models.AuditViewed)
	if err != nil {
		return nil, err
	}

	verificationsLast30, err := s.audit.CountByActionSince(ctx, orgID, models.AuditViewed, since30)
	if err != nil {
		return nil, err
	}

	trend, err := s.audit.VerificationTrend(ctx, orgID, 30)
	if err != nil {
		return nil, err
	}

	topTypes, err := s.repo.TopDocumentTypes(ctx, orgID, 5)
	if err != nil {
		return nil, err
	}

	activity, err := s.audit.RecentActivity(ctx, orgID, 8)
	if err != nil {
		return nil, err
	}

	verificationCounts, err := s.audit.VerificationCountsByDoc(ctx, orgID)
	if err != nil {
		return nil, err
	}

	return &DashboardStats{
		TotalDocuments:          counts.Total,
		ValidDocuments:          counts.Valid,
		RevokedDocuments:        counts.Revoked,
		ExpiredDocuments:        counts.Expired,
		TotalVerifications:      totalVerifications,
		DocumentsLast30Days:     docsLast30,
		VerificationsLast30Days: verificationsLast30,
		StorageUsedBytes:        storage,
		VerificationTrend:       trend,
		TopDocumentTypes:        topTypes,
		RecentActivity:          activity,
		VerificationCounts:      verificationCounts,
	}, nil
}

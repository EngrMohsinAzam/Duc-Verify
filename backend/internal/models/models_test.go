package models_test

import (
	"testing"
	"time"

	"github.com/docverify/backend/internal/models"
)

func TestEffectiveStatus(t *testing.T) {
	now := time.Date(2026, 6, 17, 12, 0, 0, 0, time.UTC)
	past := now.Add(-24 * time.Hour)
	future := now.Add(24 * time.Hour)

	revoked := &models.Document{Status: models.DocStatusRevoked}
	if revoked.EffectiveStatus(now) != models.DocStatusRevoked {
		t.Fatal("expected revoked")
	}

	expired := &models.Document{Status: models.DocStatusValid, ExpiresAt: &past}
	if expired.EffectiveStatus(now) != models.DocStatusExpired {
		t.Fatal("expected expired")
	}

	valid := &models.Document{Status: models.DocStatusValid, ExpiresAt: &future}
	if valid.EffectiveStatus(now) != models.DocStatusValid {
		t.Fatal("expected valid")
	}
}

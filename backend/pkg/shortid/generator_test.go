package shortid_test

import (
	"strings"
	"testing"

	"github.com/docverify/backend/pkg/shortid"
)

func TestGenerateFormat(t *testing.T) {
	id, err := shortid.Generate()
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(id, "DOC-") {
		t.Fatalf("expected DOC- prefix, got %s", id)
	}
	if len(id) != 10 {
		t.Fatalf("expected length 10, got %d (%s)", len(id), id)
	}
}

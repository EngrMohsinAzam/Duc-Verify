package hasher_test

import (
	"testing"

	"github.com/docverify/backend/pkg/hasher"
)

func TestHashFileDeterministic(t *testing.T) {
	data := []byte("hello docverify")
	h1 := hasher.HashFile(data)
	h2 := hasher.HashBytes(data)
	if h1 != h2 {
		t.Fatalf("expected same hash, got %s vs %s", h1, h2)
	}
	if len(h1) != 64 {
		t.Fatalf("expected 64 char hex hash, got %d", len(h1))
	}
}

func TestHashChangesOnTamper(t *testing.T) {
	h1 := hasher.HashFile([]byte("original"))
	h2 := hasher.HashFile([]byte("tampered"))
	if h1 == h2 {
		t.Fatal("hash should change when content changes")
	}
}

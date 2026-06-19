package shortid

import (
	"crypto/rand"
	"fmt"
)

const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

func Generate() (string, error) {
	b := make([]byte, 6)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate random bytes: %w", err)
	}
	for i := range b {
		b[i] = chars[int(b[i])%len(chars)]
	}
	return "DOC-" + string(b), nil
}

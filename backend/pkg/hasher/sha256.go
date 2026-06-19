package hasher

import (
	"crypto/sha256"
	"encoding/hex"
)

func HashBytes(data []byte) string {
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

func HashFile(fileBytes []byte) string {
	return HashBytes(fileBytes)
}

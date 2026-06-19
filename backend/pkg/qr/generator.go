package qr

import (
	"github.com/skip2/go-qrcode"
)

func GenerateQR(content string, size int) ([]byte, error) {
	if size <= 0 {
		size = 256
	}
	return qrcode.Encode(content, qrcode.Medium, size)
}

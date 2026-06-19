package pdf

import (
	"bytes"
	"fmt"
	"time"

	"github.com/docverify/backend/internal/models"
	"github.com/jung-kurt/gofpdf"
)

func GenerateCert(doc *models.Document, orgName, verifyURL string) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 22)
	pdf.Cell(0, 20, "Document Verification Certificate")
	pdf.Ln(25)

	pdf.SetFont("Arial", "", 12)
	lines := []string{
		fmt.Sprintf("Document ID: %s", doc.ShortID),
		fmt.Sprintf("Issuer: %s", orgName),
		fmt.Sprintf("Recipient: %s", doc.RecipientName),
		fmt.Sprintf("Document Type: %s", doc.DocType),
		fmt.Sprintf("Status: %s", doc.Status),
		fmt.Sprintf("Issued At: %s", doc.IssuedAt.UTC().Format(time.RFC3339)),
		fmt.Sprintf("SHA-256: %s", doc.SHA256Hash),
		fmt.Sprintf("Verify at: %s", verifyURL),
	}

	if doc.ExpiresAt != nil {
		lines = append(lines, fmt.Sprintf("Expires At: %s", doc.ExpiresAt.UTC().Format(time.RFC3339)))
	}

	for _, line := range lines {
		pdf.MultiCell(0, 8, line, "", "L", false)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, fmt.Errorf("pdf output: %w", err)
	}
	return buf.Bytes(), nil
}

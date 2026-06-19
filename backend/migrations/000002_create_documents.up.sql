CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id VARCHAR(20) UNIQUE NOT NULL,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    doc_type VARCHAR(100),
    sha256_hash VARCHAR(64) NOT NULL,
    s3_url TEXT NOT NULL,
    original_name VARCHAR(255),
    content_type VARCHAR(100),
    file_size BIGINT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'valid',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_short_id ON documents(short_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

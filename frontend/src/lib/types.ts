export interface ApiError {
  code: string;
  message: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  token: string;
  organization: Organization;
}

export interface Document {
  id: string;
  short_id: string;
  org_id: string;
  recipient_name: string;
  doc_type: string;
  sha256_hash: string;
  s3_url: string;
  original_name?: string;
  content_type?: string;
  file_size?: number;
  status: "valid" | "revoked" | "expired";
  issued_at: string;
  expires_at?: string;
  created_at: string;
}

export interface UploadResult {
  doc_id: string;
  short_id: string;
  qr_code_base64: string;
  sha256_hash: string;
  verify_url: string;
}

export interface VerifyResult {
  short_id: string;
  status: "valid" | "revoked" | "expired";
  recipient_name: string;
  doc_type: string;
  issuer_name: string;
  issuer_email: string;
  sha256_hash: string;
  content_type?: string;
  original_name?: string;
  issued_at: string;
  expires_at?: string;
  verified_at: string;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface DocTypeCount {
  doc_type: string;
  count: number;
}

export interface ActivityItem {
  action: string;
  short_id?: string;
  recipient_name?: string;
  created_at: string;
}

export interface DashboardStats {
  total_documents: number;
  valid_documents: number;
  revoked_documents: number;
  expired_documents: number;
  total_verifications: number;
  documents_last_30_days: number;
  verifications_last_30_days: number;
  storage_used_bytes: number;
  verification_trend: TrendPoint[];
  top_document_types: DocTypeCount[];
  recent_activity: ActivityItem[];
  verification_counts: Record<string, number>;
}

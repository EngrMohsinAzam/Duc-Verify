import axios, { AxiosError } from "axios";
import {
  ApiEnvelope,
  AuthResult,
  DashboardStats,
  Document,
  Organization,
  UploadResult,
  VerifyResult,
} from "@/lib/types";
import { clearToken, getToken } from "@/lib/auth/token";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.error?.message || "Request failed");
  }
  return envelope.data;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const { data } = await api.post<ApiEnvelope<AuthResult>>("/api/auth/register", {
    name,
    email,
    password,
  });
  return unwrap(data);
}

export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data } = await api.post<ApiEnvelope<AuthResult>>("/api/auth/login", {
    email,
    password,
  });
  return unwrap(data);
}

export async function getMe(): Promise<Organization> {
  const { data } = await api.get<ApiEnvelope<Organization>>("/api/auth/me");
  return unwrap(data);
}

export async function listDocuments(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<{ documents: Document[]; total: number }> {
  const { data } = await api.get<ApiEnvelope<Document[]>>("/api/docs", {
    params,
  });
  const documents = unwrap(data);
  return {
    documents,
    total: (data.meta?.total as number) ?? documents.length,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<ApiEnvelope<DashboardStats>>("/api/docs/stats");
  return unwrap(data);
}

export async function getDocument(id: string): Promise<Document> {
  const { data } = await api.get<ApiEnvelope<Document>>(`/api/docs/${id}`);
  return unwrap(data);
}

export async function uploadDocument(form: FormData): Promise<UploadResult> {
  const { data } = await api.post<ApiEnvelope<UploadResult>>("/api/docs", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(data);
}

export async function revokeDocument(id: string): Promise<Document> {
  const { data } = await api.patch<ApiEnvelope<Document>>(
    `/api/docs/${id}/revoke`
  );
  return unwrap(data);
}

export async function downloadPdf(id: string): Promise<Blob> {
  const { data } = await api.get(`/api/docs/${id}/pdf`, {
    responseType: "blob",
  });
  return data;
}

export async function verifyDocument(shortId: string): Promise<VerifyResult> {
  const { data } = await api.get<ApiEnvelope<VerifyResult>>(
    `/api/verify/${shortId}`
  );
  return unwrap(data);
}

export function getDocumentPreviewUrl(shortId: string): string {
  return `${baseURL}/api/verify/preview/${shortId}`;
}

export async function fetchDocumentPreview(shortId: string): Promise<Blob> {
  const { data } = await api.get(`/api/verify/preview/${shortId}`, {
    responseType: "blob",
  });
  return data;
}

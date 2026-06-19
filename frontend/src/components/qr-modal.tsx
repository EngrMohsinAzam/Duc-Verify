"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadResult } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { downloadPdf } from "@/lib/api/client";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Link2,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

export interface UploadSuccessMeta {
  recipientName: string;
  docType: string;
  expiresAt?: string;
  fileName?: string;
  fileSize?: number;
  issuerName?: string;
  issuedAt: string;
}

interface QRModalProps {
  open: boolean;
  onClose: () => void;
  result: UploadResult | null;
  meta: UploadSuccessMeta | null;
}

type CopiedField = "id" | "url" | "hash" | null;

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function QRModal({ open, onClose, result, meta }: QRModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState<CopiedField>(null);
  const [downloading, setDownloading] = useState(false);

  if (!result || !meta) return null;

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${result.short_id}`
      : result.verify_url;

  const copy = async (text: string, field: CopiedField) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadPdf(result.doc_id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.short_id}-certificate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} hideHeader fitContent>
      <div className="relative px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="relative mx-auto mb-2.5 flex h-11 w-11 items-center justify-center">
            <span className="absolute -left-0.5 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
            <span className="absolute -right-0.5 top-2 h-1 w-1 rounded-full bg-emerald-300/90" />
            <span className="absolute bottom-0.5 left-0.5 h-1 w-1 rounded-full bg-emerald-300/80" />
            <span className="absolute bottom-1 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Document Verified Successfully!
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-snug text-slate-500 sm:text-xs">
            Your document has been secured and is ready for verification.
          </p>
        </div>

        {/* QR + metadata */}
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 sm:p-3">
          <div className="grid grid-cols-[118px_1fr] gap-2.5 sm:grid-cols-[128px_1fr] sm:gap-3">
            <div className="flex flex-col items-center text-center">
              <div className="relative rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${result.qr_code_base64}`}
                  alt={`QR code for ${result.short_id}`}
                  width={112}
                  height={112}
                  className="h-[100px] w-[100px] sm:h-[112px] sm:w-[112px]"
                />
                <div className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow">
                  <Shield size={12} strokeWidth={2.5} />
                </div>
              </div>
              <p className="mt-1.5 text-[11px] font-semibold text-slate-800">
                Scan to verify
              </p>
              <p className="mt-0.5 text-[9px] leading-tight text-slate-500">
                Anyone can scan this QR code to verify the document.
              </p>
            </div>

            <dl className="grid grid-cols-1 content-start gap-x-3 gap-y-1.5 sm:grid-cols-2">
              <MetaRow label="Document ID">
                <CopyValue
                  value={result.short_id}
                  copied={copied === "id"}
                  onCopy={() => copy(result.short_id, "id")}
                  mono
                />
              </MetaRow>
              <MetaRow label="Verification Link">
                <CopyValue
                  value={verifyUrl}
                  copied={copied === "url"}
                  onCopy={() => copy(verifyUrl, "url")}
                  truncate
                />
              </MetaRow>
              <MetaRow label="Status">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Active
                </span>
              </MetaRow>
              <MetaRow label="Issued On">
                <span className="text-[11px] font-medium text-slate-800">
                  {formatDateTime(meta.issuedAt)}
                </span>
              </MetaRow>
              <MetaRow label="Expires On">
                <span className="text-[11px] font-medium text-slate-800">
                  {formatDate(meta.expiresAt)}
                </span>
              </MetaRow>
              <MetaRow label="Document Type">
                <span className="line-clamp-1 text-[11px] font-medium text-slate-800">
                  {meta.docType || "Official Document"}
                </span>
              </MetaRow>
              <MetaRow label="Recipient" icon={<User size={10} />}>
                <span className="text-[11px] font-medium text-slate-800">
                  {meta.recipientName}
                </span>
              </MetaRow>
              <MetaRow label="Issuer" icon={<Building2 size={10} />}>
                <span className="line-clamp-1 text-[11px] font-medium text-slate-800">
                  {meta.issuerName || "—"}
                </span>
              </MetaRow>
              <MetaRow label="Pages">
                <span className="text-[11px] font-medium text-slate-800">1</span>
              </MetaRow>
              <MetaRow label="File Size">
                <span className="text-[11px] font-medium text-slate-800">
                  {formatBytes(meta.fileSize)}
                </span>
              </MetaRow>
            </dl>
          </div>
        </div>

        {/* SHA-256 */}
        <div className="mt-2.5 rounded-lg bg-blue-50/50 px-2.5 py-2 sm:px-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Shield className="text-primary" size={13} />
            <h3 className="text-[11px] font-bold text-slate-900">
              SHA-256 Hash (Document Fingerprint)
            </h3>
          </div>
          <div className="relative">
            <div className="truncate rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-8 font-mono text-[9px] text-slate-700 sm:text-[10px]">
              {result.sha256_hash}
            </div>
            <button
              type="button"
              onClick={() => copy(result.sha256_hash, "hash")}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white p-0.5 text-slate-500 hover:text-primary"
              aria-label="Copy hash"
            >
              {copied === "hash" ? (
                <Check size={10} className="text-emerald-600" />
              ) : (
                <Copy size={10} />
              )}
            </button>
          </div>
          <p className="mt-1 text-[9px] leading-tight text-slate-500 sm:text-[10px]">
            This unique hash is generated using SHA-256 encryption and ensures
            the document has not been altered in any way.
          </p>
        </div>

        {/* What's next */}
        <div className="mt-3 border-t border-slate-100 pt-2.5">
          <h3 className="text-[11px] font-bold text-slate-900 sm:text-xs">
            What&apos;s Next?
          </h3>
          <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px]">
            You can download, share, or manage this document from your dashboard.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
            <ActionTile
              icon={<Download size={14} />}
              title="Download Certificate"
              subtitle="Get a PDF with QR code"
              onClick={handleDownload}
              loading={downloading}
            />
            <ActionTile
              icon={<Link2 size={14} />}
              title="Copy Link"
              subtitle="Share verification link"
              onClick={() => copy(verifyUrl, "url")}
            />
            <ActionTile
              icon={<FileText size={14} />}
              title="View Document"
              subtitle="Preview uploaded file"
              href={`/preview/${result.short_id}`}
            />
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/dashboard");
              }}
              className="flex flex-col items-start rounded-lg bg-primary p-2 text-left text-white shadow-sm transition hover:bg-primary-dark"
            >
              <ArrowRight size={14} className="ml-auto" />
              <p className="mt-1 text-[11px] font-semibold leading-tight">
                Go to Dashboard
              </p>
              <p className="text-[9px] leading-tight text-blue-100">
                Manage all documents
              </p>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MetaRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-0.5 text-[9px] font-medium text-slate-400 sm:text-[10px]">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 min-w-0">{children}</dd>
    </div>
  );
}

function CopyValue({
  value,
  copied,
  onCopy,
  mono,
  truncate,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span
        className={`min-w-0 text-[11px] font-medium text-primary ${mono ? "font-mono" : ""} ${truncate ? "truncate" : ""}`}
        title={value}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 text-slate-400 hover:text-primary"
        aria-label="Copy"
      >
        {copied ? (
          <Check size={10} className="text-emerald-600" />
        ) : (
          <Copy size={10} />
        )}
      </button>
    </div>
  );
}

function ActionTile({
  icon,
  title,
  subtitle,
  onClick,
  href,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  href?: string;
  loading?: boolean;
}) {
  const className =
    "flex h-full flex-col items-start rounded-lg border border-slate-200 bg-white p-2 text-left transition hover:border-primary/25 hover:shadow-sm";

  const inner = (
    <>
      <span className="text-primary">{icon}</span>
      <p className="mt-1 text-[10px] font-semibold leading-tight text-slate-800 sm:text-[11px]">
        {loading ? "Downloading…" : title}
      </p>
      <p className="mt-0.5 text-[8px] leading-tight text-slate-500 sm:text-[9px]">
        {subtitle}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={loading} className={className}>
      {inner}
    </button>
  );
}

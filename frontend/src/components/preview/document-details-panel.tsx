"use client";

import Link from "next/link";
import { VerifyResult } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import {
  Building2,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Hash,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

interface DocumentDetailsPanelProps {
  data: VerifyResult;
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

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="mt-0.5 shrink-0 text-primary/70">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-slate-900">{children}</div>
      </div>
    </div>
  );
}

export function DocumentDetailsPanel({ data }: DocumentDetailsPanelProps) {
  const [copied, setCopied] = useState<"id" | "hash" | null>(null);

  const copy = async (text: string, field: "id" | "hash") => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <FileText className="text-primary" size={18} />
          <h2 className="text-base font-bold text-slate-900">
            Document Information
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Official record details for this verified document.
        </p>
      </div>

      <div className="flex-1 px-5 py-1">
        <DetailRow icon={<Hash size={16} />} label="Document ID">
          <div className="flex items-center gap-2">
            <code className="font-mono text-primary">{data.short_id}</code>
            <button
              type="button"
              onClick={() => copy(data.short_id, "id")}
              className="rounded border border-slate-200 p-1 text-slate-400 hover:text-primary"
              aria-label="Copy ID"
            >
              {copied === "id" ? (
                <Check size={12} className="text-emerald-600" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
        </DetailRow>

        <DetailRow icon={<User size={16} />} label="Recipient">
          {data.recipient_name}
        </DetailRow>

        <DetailRow icon={<Building2 size={16} />} label="Issuer">
          {data.issuer_name}
        </DetailRow>

        <DetailRow icon={<FileText size={16} />} label="Document Type">
          {data.doc_type || "Official Document"}
        </DetailRow>

        <DetailRow icon={<Calendar size={16} />} label="Issued On">
          {formatDateTime(data.issued_at)}
        </DetailRow>

        <DetailRow icon={<Calendar size={16} />} label="Expires On">
          {formatDate(data.expires_at)}
        </DetailRow>

        <DetailRow icon={<Shield size={16} />} label="Verification Status">
          <StatusBadge status={data.status} compact />
        </DetailRow>

        <div className="border-b border-slate-100 py-3 last:border-0">
          <div className="flex items-start gap-3">
            <Hash size={16} className="mt-0.5 shrink-0 text-primary/70" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500">
                SHA-256 Hash (Fingerprint)
              </p>
              <div className="mt-1 flex items-start gap-2">
                <p className="break-all font-mono text-[11px] leading-relaxed text-slate-700">
                  {data.sha256_hash}
                </p>
                <button
                  type="button"
                  onClick={() => copy(data.sha256_hash, "hash")}
                  className="shrink-0 rounded border border-slate-200 p-1 text-slate-400 hover:text-primary"
                  aria-label="Copy hash"
                >
                  {copied === "hash" ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 p-5">
        <Link
          href={`/verify/${data.short_id}`}
          target="_blank"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Open Public Verification Page
          <ExternalLink size={16} />
        </Link>
      </div>
    </div>
  );
}

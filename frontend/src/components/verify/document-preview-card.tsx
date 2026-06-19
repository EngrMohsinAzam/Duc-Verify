"use client";

import Link from "next/link";
import { VerifyResult } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { DocumentMiniPreview } from "@/components/verify/document-mini-preview";
import {
  Building2,
  Calendar,
  Copy,
  Check,
  FileText,
  Hash,
  Maximize2,
  User,
} from "lucide-react";
import { useState } from "react";

interface DocumentPreviewCardProps {
  data: VerifyResult;
  shortId: string;
}

export function DocumentPreviewCard({ data, shortId }: DocumentPreviewCardProps) {
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    await navigator.clipboard.writeText(data.short_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const rows = [
    {
      icon: FileText,
      label: "Document Type",
      value: data.doc_type || "Official Document",
    },
    { icon: User, label: "Recipient", value: data.recipient_name },
    { icon: Building2, label: "Issuer", value: data.issuer_name || "—" },
    { icon: Calendar, label: "Issued Date", value: formatDate(data.issued_at) },
    { icon: Calendar, label: "Expiry Date", value: formatDate(data.expires_at) },
  ];

  return (
    <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="grid h-full grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] lg:grid-cols-[160px_1fr]">
        <div className="flex items-center justify-center border-r border-slate-100 bg-gradient-to-b from-slate-50 to-white p-2 sm:p-3">
          <Link
            href={`/preview/${shortId}`}
            className="group relative block w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-primary/30"
            aria-label="View full document"
          >
            <div className="aspect-[3/4] w-full">
              <DocumentMiniPreview
                shortId={shortId}
                contentType={data.content_type || ""}
                originalName={data.original_name || ""}
                maxWidth={150}
                maxHeight={200}
                className="absolute inset-0 h-full w-full p-0.5"
              />
            </div>
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
              <Maximize2 className="text-white drop-shadow-lg" size={16} />
            </span>
          </Link>
        </div>

        <div className="flex min-h-0 flex-col p-2.5 sm:p-3">
          <div className="mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <FileText className="text-primary" size={14} />
            <h2 className="text-xs font-semibold text-text-primary sm:text-sm">
              Document Information
            </h2>
          </div>

          <dl className="grid flex-1 grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-1.5">
                <Icon className="mt-0.5 shrink-0 text-primary/60" size={13} />
                <div className="min-w-0 flex-1">
                  <dt className="text-[10px] font-medium text-text-secondary">
                    {label}
                  </dt>
                  <dd className="truncate text-[11px] font-semibold text-text-primary sm:text-xs">
                    {value}
                  </dd>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-1.5">
              <Hash className="mt-0.5 shrink-0 text-primary/60" size={13} />
              <div className="min-w-0 flex-1">
                <dt className="text-[10px] font-medium text-text-secondary">
                  Document ID
                </dt>
                <dd className="mt-0.5 flex items-center gap-1">
                  <code className="truncate font-mono text-[11px] font-bold text-primary sm:text-xs">
                    {data.short_id}
                  </code>
                  <button
                    type="button"
                    onClick={copyId}
                    className="shrink-0 rounded border border-slate-200 p-0.5 text-text-secondary hover:text-primary"
                    aria-label="Copy document ID"
                  >
                    {copied ? (
                      <Check size={11} className="text-emerald-600" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <div className="w-[13px]" />
              <div>
                <dt className="text-[10px] font-medium text-text-secondary">
                  Status
                </dt>
                <dd className="mt-0.5">
                  <StatusBadge status={data.status} compact />
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

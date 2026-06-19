"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Document } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { downloadPdf } from "@/lib/api/client";
import {
  Copy,
  Check,
  ExternalLink,
  Search,
  MoreHorizontal,
} from "lucide-react";

interface DashboardDocumentsTableProps {
  documents: Document[];
  total: number;
  verificationCounts: Record<string, number>;
  onRevoke: (doc: Document) => void;
}

export function DashboardDocumentsTable({
  documents,
  total,
  verificationCounts,
  onRevoke,
}: DashboardDocumentsTableProps) {
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter(
      (d) =>
        d.recipient_name.toLowerCase().includes(q) ||
        d.short_id.toLowerCase().includes(q) ||
        (d.doc_type || "").toLowerCase().includes(q)
    );
  }, [documents, search]);

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const copyId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (id: string) => {
    setDownloading(id);
    try {
      const blob = await downloadPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
      setOpenMenu(null);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          All Documents ({total.toLocaleString()})
        </h3>
        <div className="relative max-w-xs flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={14}
          />
          <input
            type="search"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-background text-xs text-text-secondary">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Recipient</th>
              <th className="px-4 py-2.5 font-semibold">Document Type</th>
              <th className="px-4 py-2.5 font-semibold">Document ID</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">Issued</th>
              <th className="px-4 py-2.5 font-semibold">Expiry</th>
              <th className="px-4 py-2.5 font-semibold">Verifications</th>
              <th className="px-4 py-2.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-text-secondary"
                >
                  {search ? "No documents match your search." : "No documents yet."}
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-border/60 hover:bg-background/60"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">
                      {doc.recipient_name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {doc.doc_type || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/verify/${doc.short_id}`}
                        target="_blank"
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {doc.short_id}
                      </Link>
                      <button
                        type="button"
                        onClick={() => copyId(doc.short_id)}
                        className="text-text-secondary hover:text-primary"
                        aria-label="Copy ID"
                      >
                        {copiedId === doc.short_id ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={doc.status} compact />
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {formatDate(doc.issued_at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {formatDate(doc.expires_at)}
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-medium text-text-primary">
                    {verificationCounts[doc.id] ?? 0}
                  </td>
                  <td className="relative px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === doc.id ? null : doc.id)
                      }
                      className="rounded-lg p-1.5 hover:bg-background"
                      aria-label="Actions"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenu === doc.id && (
                      <div className="absolute right-4 top-10 z-10 min-w-[140px] rounded-lg border border-border bg-surface py-1 shadow-lg">
                        <Link
                          href={`/verify/${doc.short_id}`}
                          target="_blank"
                          className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-background"
                          onClick={() => setOpenMenu(null)}
                        >
                          <ExternalLink size={12} />
                          View
                        </Link>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-background"
                          onClick={() => handleDownload(doc.id)}
                        >
                          {downloading === doc.id ? "Downloading…" : "Download PDF"}
                        </button>
                        {doc.status === "valid" && (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error-bg"
                            onClick={() => {
                              onRevoke(doc);
                              setOpenMenu(null);
                            }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

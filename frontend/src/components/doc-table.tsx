"use client";

import Link from "next/link";
import { Document } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { downloadPdf } from "@/lib/api/client";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

interface DocTableProps {
  documents: Document[];
  onRevoke: (doc: Document) => void;
}

export function DocTable({ documents, onRevoke }: DocTableProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

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
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-border bg-background text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-semibold">Recipient</th>
              <th className="px-4 py-3 font-semibold">Document Type</th>
              <th className="px-4 py-3 font-semibold">Short ID</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Issued</th>
              <th className="px-4 py-3 font-semibold">Expiry</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-border/60 transition-colors hover:bg-background/80"
              >
                <td className="px-4 py-3.5 font-medium text-text-primary">
                  {doc.recipient_name}
                </td>
                <td className="px-4 py-3.5 text-text-secondary">
                  {doc.doc_type || "—"}
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-text-primary">
                  {doc.short_id}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3.5 text-text-secondary">
                  {formatDate(doc.issued_at)}
                </td>
                <td className="px-4 py-3.5 text-text-secondary">
                  {formatDate(doc.expires_at)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/verify/${doc.short_id}`}
                      target="_blank"
                      className="inline-flex h-9 items-center gap-1 rounded-xl border border-border px-3 text-xs font-medium text-text-primary hover:bg-background"
                    >
                      <ExternalLink size={14} />
                      View
                    </Link>
                    <Button
                      variant="secondary"
                      className="h-9 px-3 text-xs"
                      disabled={downloading === doc.id}
                      onClick={() => handleDownload(doc.id)}
                    >
                      {downloading === doc.id ? "…" : "PDF"}
                    </Button>
                    {doc.status === "valid" && (
                      <Button
                        variant="ghost"
                        className="h-9 px-3 text-xs text-error hover:bg-error-bg"
                        onClick={() => onRevoke(doc)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

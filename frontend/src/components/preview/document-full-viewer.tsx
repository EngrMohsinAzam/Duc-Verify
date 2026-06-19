"use client";

import { useEffect, useState } from "react";
import { fetchDocumentPreview } from "@/lib/api/client";
import { VerifyStamp } from "@/components/preview/verify-stamp";
import { FileText, Loader2 } from "lucide-react";

interface DocumentFullViewerProps {
  shortId: string;
  contentType?: string;
  originalName?: string;
}

export function DocumentFullViewer({
  shortId,
  contentType = "",
  originalName = "",
}: DocumentFullViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isPdf =
    contentType.includes("pdf") || originalName.toLowerCase().endsWith(".pdf");
  const isImage = contentType.startsWith("image/");

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(false);
        const blob = await fetchDocumentPreview(shortId);
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [shortId]);

  return (
    <div className="relative flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner sm:min-h-[520px]">
      {loading && (
        <div className="flex flex-1 items-center justify-center bg-white">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-1 flex-col items-center justify-center bg-white p-8 text-center">
          <FileText className="text-slate-300" size={48} />
          <p className="mt-3 text-sm text-slate-500">
            Unable to load document preview.
          </p>
        </div>
      )}

      {!loading && !error && blobUrl && (
        <div className="relative flex-1 bg-white">
          {isPdf ? (
            <iframe
              src={blobUrl}
              title={originalName || "Document preview"}
              className="h-full min-h-[420px] w-full bg-white sm:min-h-[520px]"
            />
          ) : isImage ? (
            <div className="relative flex h-full min-h-[420px] items-start justify-center bg-white p-4 sm:min-h-[520px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blobUrl}
                alt={originalName || "Document preview"}
                className="max-h-full max-w-full object-contain shadow-sm"
              />
              <VerifyStamp className="bottom-10 right-8" />
            </div>
          ) : (
            <iframe
              src={blobUrl}
              title={originalName || "Document preview"}
              className="h-full min-h-[420px] w-full bg-white sm:min-h-[520px]"
            />
          )}

          {isPdf && <VerifyStamp className="bottom-10 right-8" />}
        </div>
      )}
    </div>
  );
}

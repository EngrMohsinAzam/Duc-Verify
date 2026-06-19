"use client";

import { useEffect, useState } from "react";
import { fetchDocumentPreview } from "@/lib/api/client";
import { FileText, Loader2 } from "lucide-react";

interface DocumentMiniPreviewProps {
  shortId: string;
  contentType?: string;
  originalName?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export function DocumentMiniPreview({
  shortId,
  contentType = "",
  originalName = "",
  className = "",
  maxWidth = 220,
  maxHeight = 300,
}: DocumentMiniPreviewProps) {
  const [thumbSrc, setThumbSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isPdf =
    contentType.includes("pdf") || originalName.toLowerCase().endsWith(".pdf");
  const isImage = contentType.startsWith("image/");

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(false);
        const blob = await fetchDocumentPreview(shortId);
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);

        if (isPdf) {
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

          const pdf = await pdfjs.getDocument({ url: objectUrl }).promise;
          const page = await pdf.getPage(1);

          const base = page.getViewport({ scale: 1 });
          const scale = Math.min(maxWidth / base.width, maxHeight / base.height);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("canvas unavailable");

          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          if (!cancelled) {
            setThumbSrc(canvas.toDataURL("image/jpeg", 0.92));
          }
        } else if (isImage) {
          setThumbSrc(objectUrl);
        } else {
          setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (objectUrl && isImage) URL.revokeObjectURL(objectUrl);
    };
  }, [shortId, isPdf, isImage, maxWidth, maxHeight]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-white ${className}`}>
        <Loader2 className="animate-spin text-primary/50" size={24} />
      </div>
    );
  }

  if (error || !thumbSrc) {
    return (
      <div className={`flex items-center justify-center bg-white ${className}`}>
        <FileText className="text-slate-300" size={36} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={thumbSrc}
      alt={originalName || "Document preview"}
      className={`h-full w-full object-contain object-top bg-white ${className}`}
    />
  );
}

export function useDocumentPreviewBlob(shortId: string, enabled: boolean) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let url: string | null = null;

    fetchDocumentPreview(shortId).then((blob) => {
      url = URL.createObjectURL(blob);
      setBlobUrl(url);
    });

    return () => {
      if (url) URL.revokeObjectURL(url);
      setBlobUrl(null);
    };
  }, [shortId, enabled]);

  return blobUrl;
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useVerifyDocument } from "@/hooks/useDocuments";
import { DocumentFullViewer } from "@/components/preview/document-full-viewer";
import { DocumentDetailsPanel } from "@/components/preview/document-details-panel";
import { ShieldCheck, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

export default function DocumentPreviewPage() {
  const params = useParams();
  const shortId = params.shortId as string;
  const { data, isLoading, error } = useVerifyDocument(shortId);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <ShieldCheck size={18} strokeWidth={2.5} />
            </span>
            <span className="text-lg font-bold text-slate-900">DocVerify</span>
          </Link>
          <Link
            href={`/verify/${shortId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to verification
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Document Preview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review the uploaded document with its official verification stamp
            and record details.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto text-red-500" size={32} />
            <h2 className="mt-3 font-bold text-slate-900">Document Not Found</h2>
            <p className="mt-1 text-sm text-slate-500">
              This preview link is invalid or the document no longer exists.
            </p>
          </div>
        )}

        {data && (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <DocumentFullViewer
              shortId={shortId}
              contentType={data.content_type || ""}
              originalName={data.original_name || ""}
            />
            <DocumentDetailsPanel data={data} />
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import { FileDropzone } from "@/components/file-dropzone";
import { QRModal, UploadSuccessMeta } from "@/components/qr-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUploadDocument } from "@/hooks/useDocuments";
import { UploadResult } from "@/lib/types";
import { AxiosError } from "axios";
import { ApiEnvelope } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function UploadPage() {
  return (
    <AuthGuard>
      <UploadContent />
    </AuthGuard>
  );
}

function UploadContent() {
  const { user, logout } = useAuth();
  const uploadMutation = useUploadDocument();

  const [file, setFile] = useState<File | null>(null);
  const [recipient, setRecipient] = useState("");
  const [docType, setDocType] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploadMeta, setUploadMeta] = useState<UploadSuccessMeta | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFileError(null);
    setFormError(null);

    if (!file) {
      setFileError("Please upload a PDF or image file.");
      return;
    }
    if (!recipient.trim()) {
      setFormError("Recipient name is required.");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("recipient_name", recipient.trim());
    if (docType.trim()) form.append("doc_type", docType.trim());
    if (expiresAt) {
      form.append("expires_at", new Date(expiresAt).toISOString());
    }

    try {
      const data = await uploadMutation.mutateAsync(form);
      setUploadMeta({
        recipientName: recipient.trim(),
        docType: docType.trim(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        fileName: file.name,
        fileSize: file.size,
        issuerName: user?.name,
        issuedAt: new Date().toISOString(),
      });
      setResult(data);
      setModalOpen(true);
      setFile(null);
      setRecipient("");
      setDocType("");
      setExpiresAt("");
    } catch (err) {
      const axiosErr = err as AxiosError<ApiEnvelope<unknown>>;
      setFormError(
        axiosErr.response?.data?.error?.message ||
          "Something went wrong while creating the record. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar orgName={user?.name} onLogout={logout} showUpload={false} />

      <main className="mx-auto max-w-[760px] px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Upload new document
        </h1>
        <p className="mt-1 text-text-secondary">
          Create a tamper-proof verification record with QR code.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8"
        >
          <FileDropzone
            file={file}
            onFileChange={setFile}
            error={fileError || undefined}
          />

          <Input
            label="Recipient name"
            required
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Full name of document recipient"
          />

          <Input
            label="Document type"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            placeholder="e.g. Employment Certificate"
          />

          <Input
            label="Expiry date"
            type="date"
            hint="Optional — document will show as expired after this date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />

          {formError && (
            <p
              className="rounded-xl border border-error-border bg-error-bg px-3 py-2.5 text-sm text-error"
              role="alert"
            >
              {formError}
            </p>
          )}

          <Button type="submit" fullWidth disabled={uploadMutation.isPending}>
            {uploadMutation.isPending
              ? "Creating secure record…"
              : "Create verification record"}
          </Button>
        </form>
      </main>

      <QRModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        result={result}
        meta={uploadMeta}
      />
    </div>
  );
}

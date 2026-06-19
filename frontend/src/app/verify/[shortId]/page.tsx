"use client";

import { useParams } from "next/navigation";
import { useVerifyDocument } from "@/hooks/useDocuments";
import { BlockchainBackground } from "@/components/verify/blockchain-background";
import { VerifyHeader } from "@/components/verify/verify-header";
import { StatusHero } from "@/components/verify/status-hero";
import { DocumentPreviewCard } from "@/components/verify/document-preview-card";
import { SecuritySection } from "@/components/verify/security-section";
import { HowItWorksSection } from "@/components/verify/how-it-works";
import { VerifyFooter } from "@/components/verify/verify-footer";
import { AlertCircle, Loader2 } from "lucide-react";

export default function VerifyPage() {
  const params = useParams();
  const shortId = params.shortId as string;
  const { data, isLoading, error } = useVerifyDocument(shortId);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <BlockchainBackground />
      <VerifyHeader />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-2 overflow-hidden px-3 py-2 sm:gap-2.5 sm:px-5 sm:py-3">
        {isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={24} />
            <p className="mt-2 text-xs text-text-secondary">Verifying…</p>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-sm rounded-xl border border-red-200 bg-white p-5 text-center shadow-sm">
            <AlertCircle className="mx-auto text-red-500" size={24} />
            <h1 className="mt-2 text-sm font-bold">Document Not Found</h1>
            <p className="mt-1 text-xs text-text-secondary">
              Invalid link or record does not exist.
            </p>
          </div>
        )}

        {data && (
          <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-2.5">
            <StatusHero data={data} />
            <DocumentPreviewCard data={data} shortId={shortId} />
            <SecuritySection hash={data.sha256_hash} />
            <HowItWorksSection />
            <VerifyFooter />
          </div>
        )}
      </main>
    </div>
  );
}

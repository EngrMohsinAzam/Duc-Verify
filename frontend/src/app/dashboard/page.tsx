"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  StatsCards,
  DashboardWelcome,
} from "@/components/dashboard/stats-cards";
import { VerificationAnalytics } from "@/components/dashboard/verification-analytics";
import { DashboardDocumentsTable } from "@/components/dashboard/dashboard-documents-table";
import {
  QuickActions,
  RecentActivity,
  SecurityTrustCard,
} from "@/components/dashboard/dashboard-bottom-panels";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  useDashboardStats,
  useDocuments,
  useRevokeDocument,
} from "@/hooks/useDocuments";
import { Document } from "@/lib/types";
import { FileText, Loader2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const { data: stats, isLoading: statsLoading, error: statsError } =
    useDashboardStats();
  const { data: docsData, isLoading: docsLoading, error: docsError } =
    useDocuments(1, 50);
  const revokeMutation = useRevokeDocument();
  const [revokeTarget, setRevokeTarget] = useState<Document | null>(null);

  const isLoading = statsLoading || docsLoading;
  const error = statsError || docsError;

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    await revokeMutation.mutateAsync(revokeTarget.id);
    setRevokeTarget(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        orgName={user?.name}
        stats={stats}
        onLogout={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
            <DashboardWelcome orgName={user?.name} />

            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={28} />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-error-border bg-error-bg p-4 text-error">
                Failed to load dashboard. Is the backend running?
              </div>
            )}

            {stats && docsData && (
              <>
                <StatsCards stats={stats} />

                {docsData.documents.length > 0 ? (
                  <>
                    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                      <VerificationAnalytics
                        trend={stats.verification_trend}
                        topTypes={stats.top_document_types}
                        total={stats.total_documents}
                      />
                      <DashboardDocumentsTable
                        documents={docsData.documents}
                        total={docsData.total}
                        verificationCounts={stats.verification_counts}
                        onRevoke={setRevokeTarget}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <QuickActions />
                      <RecentActivity items={stats.recent_activity} />
                      <SecurityTrustCard />
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center shadow-sm">
                    <FileText
                      className="mx-auto text-text-secondary/50"
                      size={48}
                      strokeWidth={1.25}
                    />
                    <p className="mt-4 font-medium text-text-primary">
                      No documents issued yet
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
                      Upload your first verified document to generate a QR code
                      and public verification link.
                    </p>
                    <Link
                      href="/upload"
                      className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      Upload New Document
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Modal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke document"
      >
        <p className="text-sm text-text-secondary">
          Revoke{" "}
          <span className="font-mono font-medium text-text-primary">
            {revokeTarget?.short_id}
          </span>
          ? Public verification will show this document as revoked.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            variant="danger"
            fullWidth
            disabled={revokeMutation.isPending}
            onClick={handleRevoke}
          >
            {revokeMutation.isPending ? "Revoking…" : "Confirm revoke"}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setRevokeTarget(null)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

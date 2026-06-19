import Link from "next/link";
import {
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { DashboardStats } from "@/lib/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

function pct(part: number, total: number) {
  if (total === 0) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      label: "Total Documents",
      value: stats.total_documents,
      sub: `${stats.documents_last_30_days} uploaded in last 30 days`,
      iconBg: "bg-blue-50",
      iconColor: "text-primary",
      Icon: FileText,
    },
    {
      label: "Valid Documents",
      value: stats.valid_documents,
      sub: `${pct(stats.valid_documents, stats.total_documents)} of total`,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      Icon: CheckCircle2,
    },
    {
      label: "Revoked Documents",
      value: stats.revoked_documents,
      sub: `${pct(stats.revoked_documents, stats.total_documents)} of total`,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      Icon: XCircle,
    },
    {
      label: "Expired Documents",
      value: stats.expired_documents,
      sub: `${pct(stats.expired_documents, stats.total_documents)} of total`,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      Icon: Clock,
    },
    {
      label: "Total Verifications",
      value: stats.total_verifications,
      sub: `${stats.verifications_last_30_days} in last 30 days`,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      Icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {items.map(({ label, value, sub, iconBg, iconColor, Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-surface p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary">{label}</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {value.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">{sub}</p>
            </div>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}
            >
              <Icon className={iconColor} size={18} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardWelcome({ orgName }: { orgName?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
          Welcome back, {orgName || "there"} 👋
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Here&apos;s what&apos;s happening with your documents today.
        </p>
      </div>
      <Link
        href="/upload"
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-primary-dark"
      >
        <Plus size={18} />
        Upload New Document
      </Link>
    </div>
  );
}

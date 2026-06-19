"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Shield,
  LogOut,
} from "lucide-react";
import { DashboardStats } from "@/lib/types";

interface DashboardSidebarProps {
  orgName?: string;
  stats?: DashboardStats;
  onLogout?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Document", icon: Upload },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function DashboardSidebar({
  orgName,
  stats,
  onLogout,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const storageUsed = stats?.storage_used_bytes ?? 0;
  const storageLimit = 200 * 1024 * 1024 * 1024;
  const storagePct = Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Shield size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold text-text-primary">DocVerify</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          Documents
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-blue-50 text-primary"
                  : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text-primary">
              {orgName || "Organization"}
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Active
            </span>
          </div>
          <p className="mt-2 text-[10px] text-text-secondary">Storage used</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(storagePct, 2)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-text-secondary">
            {formatBytes(storageUsed)} used
          </p>
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-slate-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}

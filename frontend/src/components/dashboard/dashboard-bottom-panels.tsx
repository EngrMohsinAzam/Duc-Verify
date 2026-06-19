import Link from "next/link";
import { Upload, FileStack, Shield, BookOpen } from "lucide-react";
import { ActivityItem } from "@/lib/types";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

const quickActions = [
  { href: "/upload", label: "Upload Document", icon: Upload },
  { href: "/upload", label: "Bulk Upload", icon: FileStack, disabled: true },
  { href: "#", label: "Create Template", icon: BookOpen, disabled: true },
  {
    href: `${apiBase}/swagger/index.html`,
    label: "View API Docs",
    icon: Shield,
    external: true,
  },
];

function activityLabel(item: ActivityItem) {
  const id = item.short_id ? ` ${item.short_id}` : "";
  switch (item.action) {
    case "viewed":
      return `Document${id} was verified`;
    case "revoked":
      return `Document${id} was revoked`;
    case "uploaded":
      return `New document${id} was uploaded`;
    default:
      return `Document${id} — ${item.action}`;
  }
}

function activityStatus(action: string) {
  switch (action) {
    case "viewed":
      return { label: "SUCCESS", className: "bg-emerald-50 text-emerald-700" };
    case "revoked":
      return { label: "REVOKED", className: "bg-red-50 text-red-700" };
    case "uploaded":
      return { label: "UPLOADED", className: "bg-blue-50 text-primary" };
    default:
      return { label: action.toUpperCase(), className: "bg-slate-50 text-slate-600" };
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary">Quick Actions</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {quickActions.map(({ href, label, icon: Icon, disabled, external }) => {
          const className = `flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs font-medium transition ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "hover:border-primary/30 hover:bg-blue-50/50"
          }`;
          if (disabled) {
            return (
              <div key={label} className={className}>
                <Icon size={14} className="text-primary" />
                {label}
              </div>
            );
          }
          return (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className={className}
            >
              <Icon size={14} className="text-primary" />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-text-secondary">No activity yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item, i) => {
            const status = activityStatus(item.action);
            return (
              <li key={`${item.created_at}-${i}`} className="flex gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-text-primary">
                    {activityLabel(item)}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function SecurityTrustCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary">
        Security &amp; Trust
      </h3>
      <ul className="mt-3 space-y-2 text-xs text-slate-600">
        <li>All documents secured with SHA-256 encryption</li>
        <li>Tamper-proof verification on every scan</li>
        <li>Public verification available 24/7 worldwide</li>
      </ul>
      <Shield
        className="absolute -bottom-2 -right-2 text-primary/10"
        size={80}
        strokeWidth={1}
      />
    </div>
  );
}

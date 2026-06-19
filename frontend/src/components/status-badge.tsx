import { Document } from "@/lib/types";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

type Status = Document["status"] | "valid" | "revoked" | "expired";

const config: Record<
  Status,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  valid: {
    label: "Valid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Icon: CheckCircle2,
  },
  revoked: {
    label: "Revoked",
    className: "bg-red-50 text-red-700 border-red-200",
    Icon: AlertCircle,
  },
  expired: {
    label: "Expired",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    Icon: Clock,
  },
};

export function StatusBadge({
  status,
  compact = false,
}: {
  status: Status;
  compact?: boolean;
}) {
  const { label, className, Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold capitalize ${compact ? "px-2 py-0.5 text-[10px]" : "gap-1.5 px-3 py-1 text-sm"} ${className}`}
    >
      <Icon size={compact ? 10 : 14} strokeWidth={2.5} aria-hidden />
      {label}
    </span>
  );
}

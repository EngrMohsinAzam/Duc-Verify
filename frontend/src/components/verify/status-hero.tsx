"use client";

import { VerifyResult } from "@/lib/types";
import { AlertCircle, CheckCircle2, Clock, BadgeCheck } from "lucide-react";

const config = {
  valid: {
    title: "Valid Document",
    message: "This document is valid and matches the issuer's record.",
    ring: "bg-emerald-500",
    titleColor: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Icon: CheckCircle2,
  },
  revoked: {
    title: "Revoked Document",
    message: "This document has been revoked by the issuer.",
    ring: "bg-red-600",
    titleColor: "text-red-700",
    badge: "bg-red-50 text-red-800 border-red-200",
    Icon: AlertCircle,
  },
  expired: {
    title: "Expired Document",
    message: "This document was valid but has now expired.",
    ring: "bg-amber-500",
    titleColor: "text-amber-700",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    Icon: Clock,
  },
};

export function StatusHero({ data }: { data: VerifyResult }) {
  const c = config[data.status];
  const verifiedAt = new Date(data.verified_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div className="shrink-0 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white sm:h-11 sm:w-11 ${c.ring}`}
        >
          <c.Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className={`text-sm font-bold sm:text-base ${c.titleColor}`}>
            {c.title}
          </h1>
          <p className="truncate text-[11px] text-text-secondary sm:text-xs">
            {c.message}
          </p>
        </div>
        <div
          className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium sm:inline-flex sm:text-xs ${c.badge}`}
        >
          <BadgeCheck size={12} />
          Verified {verifiedAt}
        </div>
      </div>
      <div
        className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium sm:hidden ${c.badge}`}
      >
        <BadgeCheck size={12} />
        Verified {verifiedAt}
      </div>
    </div>
  );
}

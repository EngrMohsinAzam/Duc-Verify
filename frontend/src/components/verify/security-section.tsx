"use client";

import { Shield, Copy, Check } from "lucide-react";
import { useState } from "react";

export function SecuritySection({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  const copyHash = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="shrink-0 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-1.5">
          <Shield className="text-primary" size={14} />
          <h2 className="text-xs font-semibold text-text-primary">
            Security &amp; Integrity
          </h2>
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 pr-8 font-mono text-[10px] text-text-primary sm:text-[11px]">
            {hash}
          </div>
          <button
            type="button"
            onClick={copyHash}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white p-0.5 text-text-secondary hover:text-primary"
            aria-label="Copy hash"
          >
            {copied ? (
              <Check size={11} className="text-emerald-600" />
            ) : (
              <Copy size={11} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

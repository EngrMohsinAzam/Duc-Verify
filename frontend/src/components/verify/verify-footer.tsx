import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function VerifyFooter() {
  return (
    <div className="shrink-0 space-y-1.5 pb-1">
      <div className="flex items-center justify-between gap-2 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="shrink-0 text-primary" size={14} />
          <p className="truncate text-[10px] leading-snug text-slate-600 sm:text-[11px]">
            DocVerify helps organizations issue tamper-proof digital documents
            anyone can verify instantly.
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-md border border-primary bg-white px-2 py-1 text-[10px] font-semibold text-primary transition hover:bg-blue-50 sm:text-[11px]"
        >
          Learn more
        </Link>
      </div>

      <footer className="text-center">
        <p className="text-[10px] font-semibold text-text-primary sm:text-[11px]">
          Powered by DocVerify
        </p>
      </footer>
    </div>
  );
}

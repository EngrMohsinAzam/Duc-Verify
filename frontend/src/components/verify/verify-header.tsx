import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function VerifyHeader() {
  return (
    <header className="relative z-10 shrink-0 border-b border-white/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center px-3 py-2 sm:px-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white shadow-sm">
            <ShieldCheck size={16} strokeWidth={2.5} />
          </span>
          <span className="text-base font-bold tracking-tight text-text-primary">
            DocVerify
          </span>
        </Link>
      </div>
    </header>
  );
}

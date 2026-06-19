import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textSize =
    size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";
  const iconSize = size === "sm" ? 22 : size === "lg" ? 30 : 26;

  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <span className="flex items-center justify-center text-primary">
        <ShieldCheck size={iconSize} strokeWidth={2} aria-hidden />
      </span>
      <span className={`${textSize} font-bold tracking-tight`}>
        <span className="text-text-primary">Doc</span>
        <span className="text-primary">Verify</span>
      </span>
    </Link>
  );
}

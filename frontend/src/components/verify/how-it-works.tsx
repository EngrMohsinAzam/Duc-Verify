import { Shield, Search, Lock } from "lucide-react";

const steps = [
  {
    icon: Shield,
    iconBg: "bg-emerald-100 text-emerald-700",
    title: "Secure Issuance",
    text: "Unique digital fingerprint created on upload.",
  },
  {
    icon: Search,
    iconBg: "bg-blue-100 text-primary",
    title: "Public Verification",
    text: "Anyone with the link or QR can verify.",
  },
  {
    icon: Lock,
    iconBg: "bg-violet-100 text-violet-700",
    title: "Tamper-Proof",
    text: "Any change invalidates verification.",
  },
];

export function HowItWorksSection() {
  return (
    <div className="shrink-0">
      <h2 className="mb-1.5 text-center text-[11px] font-semibold text-text-primary sm:text-xs">
        How verification works
      </h2>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {steps.map(({ icon: Icon, iconBg, title, text }) => (
          <div
            key={title}
            className="rounded-lg border border-slate-200/80 bg-white px-2 py-2 text-center shadow-sm sm:px-3 sm:py-2.5"
          >
            <div
              className={`mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${iconBg}`}
            >
              <Icon size={14} strokeWidth={2} />
            </div>
            <h3 className="text-[10px] font-semibold text-text-primary sm:text-[11px]">
              {title}
            </h3>
            <p className="mt-0.5 hidden text-[10px] leading-snug text-text-secondary sm:block">
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

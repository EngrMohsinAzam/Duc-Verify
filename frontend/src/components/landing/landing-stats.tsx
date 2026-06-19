import { FileText, ShieldCheck, Building2, Globe } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const stats = [
  {
    icon: FileText,
    value: "1,248,352+",
    label: "Documents Issued",
    iconBg: "bg-blue-50 text-primary",
  },
  {
    icon: ShieldCheck,
    value: "5,721,841+",
    label: "Verifications Completed",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Building2,
    value: "12,840+",
    label: "Organizations",
    iconBg: "bg-violet-50 text-violet-600",
  },
  {
    icon: Globe,
    value: "180+",
    label: "Countries Worldwide",
    iconBg: "bg-amber-50 text-amber-600",
  },
];

export function LandingStats() {
  return (
    <section id="pricing" className="border-y border-slate-100 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label, iconBg }, i) => (
            <ScrollReveal key={label} variant="scale-in" delay={i * 80}>
              <div className="text-center">
                <div
                  className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <p className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

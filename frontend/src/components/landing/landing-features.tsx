import { Shield, QrCode, Lock, Users } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const features = [
  {
    icon: Shield,
    iconBg: "bg-blue-50 text-primary",
    title: "Tamper-Proof Security",
    text: "Every document gets a unique SHA-256 fingerprint. Any change after issuance breaks verification instantly.",
  },
  {
    icon: QrCode,
    iconBg: "bg-emerald-50 text-emerald-600",
    title: "Instant Verification",
    text: "Share a QR code or link. Anyone can verify authenticity in seconds — no account required.",
  },
  {
    icon: Lock,
    iconBg: "bg-violet-50 text-violet-600",
    title: "Easy Document Management",
    text: "Upload, track, revoke, and download certificates from one dashboard built for issuers.",
  },
  {
    icon: Users,
    iconBg: "bg-amber-50 text-amber-600",
    title: "Built for Organizations",
    text: "Designed for universities, corporations, and government bodies issuing official records at scale.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal variant="fade-up" className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything you need to issue and verify with confidence
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {features.map(({ icon: Icon, iconBg, title, text }, i) => (
            <ScrollReveal key={title} variant="fade-up" delay={i * 90}>
              <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
                >
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

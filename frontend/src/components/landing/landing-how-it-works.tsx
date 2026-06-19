import { FileUp, Settings, UserCheck, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const steps = [
  {
    num: 1,
    icon: FileUp,
    title: "Upload Document",
    text: "Upload a PDF or image, add recipient details, and set an optional expiry date.",
  },
  {
    num: 2,
    icon: Settings,
    title: "We Secure & Generate",
    text: "We create a SHA-256 hash, store the file securely, and generate a QR code plus verify link.",
  },
  {
    num: 3,
    icon: UserCheck,
    title: "Anyone Can Verify",
    text: "Recipients and third parties scan the QR or open the link to confirm the document is authentic.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal variant="fade-up" className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How DocVerify Works
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Simple process. Maximum trust.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map(({ num, icon: Icon, title, text }, i) => (
            <ScrollReveal key={title} variant="fade-up" delay={i * 120}>
              <div className="relative text-center">
                {i < steps.length - 1 && (
                  <ArrowRight
                    className="absolute -right-4 top-9 hidden h-5 w-5 text-slate-300 md:block"
                    strokeWidth={1.5}
                  />
                )}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-md shadow-primary/20">
                  {num}
                </div>
                <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <Icon className="text-primary" size={26} strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
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

import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function LandingCTA() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden>
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="cta-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <ScrollReveal variant="fade-up" className="relative mx-auto max-w-2xl px-5 sm:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white">
            <BadgeCheck size={14} />
            Get Started Today
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Start issuing trusted digital documents today
          </h2>
          <p className="mt-3 text-base text-blue-100">
            Join thousands of organizations building trust with DocVerify.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-primary shadow-lg transition hover:bg-blue-50"
            >
              Get Started for Free
              <ArrowRight size={16} />
            </Link>
            <a
              href="mailto:hello@docverify.com"
              className="inline-flex h-11 items-center rounded-xl border-2 border-white/40 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

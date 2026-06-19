"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Shield, QrCode, BadgeCheck } from "lucide-react";
import { useHeroParallax } from "@/components/landing/use-hero-parallax";

export function LandingHero() {
  const { sectionRef, bgOffset, imageOffset } = useHeroParallax();

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-12"
    >
      <div
        className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"
        aria-hidden
        style={{ transform: `translate3d(0, ${bgOffset}px, 0)` }}
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl"
        aria-hidden
        style={{ transform: `translate3d(0, ${bgOffset * 0.7}px, 0)` }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 xl:gap-16">
        <div className="max-w-xl lg:max-w-none">
          <div className="landing-hero-enter inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
            <Shield size={13} />
            Trusted by organizations worldwide
          </div>

          <h1 className="landing-hero-enter landing-hero-enter-delay-1 mt-5 text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            Verify Documents.{" "}
            <span className="text-primary">Build Trust.</span>
          </h1>

          <p className="landing-hero-enter landing-hero-enter-delay-2 mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            DocVerify helps organizations issue tamper-proof digital documents
            with QR codes and verification links — so anyone can confirm
            authenticity instantly.
          </p>

          <div className="landing-hero-enter landing-hero-enter-delay-3 mt-7 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark"
            >
              Get Started for Free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-white"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-primary">
                <Play size={12} fill="currentColor" />
              </span>
              See How It Works
            </a>
          </div>

          <div className="landing-hero-enter landing-hero-enter-delay-3 mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            {[
              { icon: Shield, text: "Tamper-proof SHA-256 Security" },
              { icon: QrCode, text: "Instant Verification via QR or Link" },
              { icon: BadgeCheck, text: "Compliant & Enterprise Ready" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm"
              >
                <Icon size={15} className="shrink-0 text-primary" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none lg:justify-self-end"
          style={{ transform: `translate3d(0, ${imageOffset}px, 0)` }}
        >
          <div className="landing-hero-enter landing-hero-enter-delay-2">
            <Image
            src="/hero-section-landing-page/image-hero.png"
            alt="DocVerify certificate verification preview"
            width={760}
            height={640}
            priority
            className="h-auto w-full object-contain"
          />
          </div>
        </div>
      </div>
    </section>
  );
}

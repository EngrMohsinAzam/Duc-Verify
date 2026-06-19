"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary">
      {children}
    </span>
  );
}

const productLinks = ["Features", "How It Works", "Pricing", "Security"];
const resourceLinks = [
  "Documentation",
  "API Reference",
  "Help Center",
  "Blog",
];
const companyLinks = [
  "About Us",
  "Careers",
  "Contact Us",
  "Privacy Policy",
];

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <ScrollReveal variant="fade-in">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
                <ShieldCheck size={15} strokeWidth={2.5} />
              </span>
              <span className="text-base font-bold text-slate-900">DocVerify</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Building trust in every document. Every time.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900">Product</h4>
            <ul className="mt-3 space-y-2">
              {productLinks.map((link) => (
                <li key={link}>
                  <a
                    href={
                      link === "Features"
                        ? "#features"
                        : link === "How It Works"
                          ? "#how-it-works"
                          : link === "Pricing"
                            ? "#pricing"
                            : "#"
                    }
                    className="text-xs text-slate-500 transition hover:text-primary"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900">Resources</h4>
            <ul className="mt-3 space-y-2">
              {resourceLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-xs text-slate-500 transition hover:text-primary"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900">Company</h4>
            <ul className="mt-3 space-y-2">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-xs text-slate-500 transition hover:text-primary"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900">
              Stay Updated
            </h4>
            <p className="mt-3 text-xs text-slate-500">
              Get the latest updates on document verification and security.
            </p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="h-8 flex-1 rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="h-8 shrink-0 rounded-md bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-dark"
              >
                Subscribe
              </button>
            </form>
            <div className="mt-4 flex gap-2">
              <a href="#" aria-label="Twitter">
                <SocialIcon>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialIcon>
              </a>
              <a href="#" aria-label="LinkedIn">
                <SocialIcon>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.127 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </SocialIcon>
              </a>
              <a href="#" aria-label="GitHub">
                <SocialIcon>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </SocialIcon>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © 2025 DocVerify. All rights reserved.
        </div>
      </div>
      </ScrollReveal>
    </footer>
  );
}

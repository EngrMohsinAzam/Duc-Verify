"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
];

export function LandingNavbar() {
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-blue-200/40 bg-[#ecf1f9]/75 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <ShieldCheck size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            DocVerify
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-slate-600 transition hover:text-primary"
            >
              {label}
            </a>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-primary"
            >
              Resources
              <ChevronDown
                size={14}
                className={`transition ${resourcesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {resourcesOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-200/80 bg-white py-2 shadow-lg">
                {["Documentation", "API Reference", "Help Center", "Blog"].map(
                  (item) => (
                    <a
                      key={item}
                      href="#"
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary"
                      onClick={() => setResourcesOpen(false)}
                    >
                      {item}
                    </a>
                  )
                )}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-slate-600 hover:text-primary sm:inline"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

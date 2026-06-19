"use client";

import { Logo } from "@/components/logo";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

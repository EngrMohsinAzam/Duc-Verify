"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  orgName?: string;
  onLogout?: () => void;
  showUpload?: boolean;
}

export function Navbar({ orgName, onLogout, showUpload = true }: NavbarProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3 sm:gap-4">
          {orgName && (
            <span className="hidden text-sm font-medium text-text-secondary sm:inline">
              {orgName}
            </span>
          )}
          {showUpload && (
            <Link
              href="/upload"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-primary-dark sm:px-5"
            >
              <span className="hidden sm:inline">Upload New Document</span>
              <span className="sm:hidden">Upload</span>
            </Link>
          )}
          {onLogout && (
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

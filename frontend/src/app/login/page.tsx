"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { ApiEnvelope } from "@/lib/types";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiEnvelope<unknown>>;
      setError(
        axiosErr.response?.data?.error?.message ||
          "Incorrect email or password. Please try again."
      );
    }
  }

  return (
    <AuthLayout
      title="Sign in to DocVerify"
      subtitle="Manage and verify issued documents securely."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p
            className="rounded-xl border border-error-border bg-error-bg px-3 py-2.5 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isLoggingIn}>
          {isLoggingIn ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { ApiEnvelope } from "@/lib/types";

export default function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register({ name, email, password });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiEnvelope<unknown>>;
      setError(
        axiosErr.response?.data?.error?.message ||
          "Something went wrong while creating your account. Please try again."
      );
    }
  }

  return (
    <AuthLayout
      title="Create issuer account"
      subtitle="Register your organization to issue verified documents."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Organization name"
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={8}
          hint="Minimum 8 characters"
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

        <Button type="submit" fullWidth disabled={isRegistering}>
          {isRegistering ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { AuthShell } from "@/components/auth/AuthShell";

function getRedirect() {
  if (typeof window === "undefined") return "/dashboard";
  return new URLSearchParams(window.location.search).get("redirect") ?? "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return setError(error.message);
    router.push(getRedirect());
    router.refresh();
  }

  async function magicLink() {
    if (!email) return setError("Enter your email first.");
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${getRedirect()}`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setMagicSent(true);
  }

  return (
    <AuthShell title="Sign in to NIST Compass">
      <form onSubmit={signIn} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {magicSent && (
          <p className="text-sm text-green-600">
            Check your email for a sign-in link.
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" /> or{" "}
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <Button
        variant="secondary"
        className="w-full"
        onClick={magicLink}
        disabled={loading}
      >
        Email me a magic link
      </Button>

      <p className="mt-6 text-center text-sm text-gray-500">
        New here?{" "}
        <Link href="/signup" className="font-medium text-brand-600">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

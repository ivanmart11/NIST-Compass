"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { AuthShell } from "@/components/auth/AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
          `/onboarding?org=${encodeURIComponent(orgName)}`
        )}`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);

    // Email confirmation OFF → a session exists now. Send them to onboarding
    // (server-rendered, reads the session cookie) to name their org.
    if (data.session) {
      router.push(`/onboarding?org=${encodeURIComponent(orgName)}`);
      router.refresh();
      return;
    }

    // Email confirmation ON → no session yet. Tell them to confirm; the
    // confirmation link returns to /auth/callback and then onboarding.
    setInfo(
      "Account created. Check your email to confirm your address, then you'll finish setting up your organization."
    );
  }

  return (
    <AuthShell title="Create your account">
      <form onSubmit={signUp} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Organization name</label>
          <input
            className="input"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
        </div>
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
            minLength={6}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-600">{info}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

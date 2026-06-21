"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

function initialOrg() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("org") ?? "";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState(initialOrg);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_name: orgName }),
    });
    setLoading(false);
    if (!res.ok) return setError("Could not create your organization.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-xl font-semibold text-gray-800">
          Set up your organization
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          This is the workspace your team will share.
        </p>
        <form onSubmit={create} className="card space-y-4 p-6">
          <div>
            <label className="label">Organization name</label>
            <input
              className="input"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating…" : "Continue"}
          </Button>
        </form>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import type { Membership } from "@/lib/auth";
import { setActiveOrg, signOut } from "@/app/(app)/actions";
import { cn } from "@/lib/utils";

export function TopBar({
  orgName,
  orgId,
  email,
  memberships,
}: {
  orgName: string;
  orgId: string;
  email: string;
  memberships: Membership[];
}) {
  const [orgOpen, setOrgOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const initials = (email[0] ?? "?").toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="relative">
        <button
          onClick={() => setOrgOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          {orgName}
          <Chevron />
        </button>
        {orgOpen && memberships.length > 0 && (
          <div className="absolute left-0 top-11 z-10 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            {memberships.map((m) => (
              <form key={m.org_id} action={setActiveOrg.bind(null, m.org_id)}>
                <button
                  type="submit"
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50",
                    m.org_id === orgId && "font-medium text-brand-700"
                  )}
                >
                  {m.organizations?.name ?? "Organization"}
                  <span className="text-xs text-gray-400">{m.role}</span>
                </button>
              </form>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setUserOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white">
            {initials}
          </span>
        </button>
        {userOpen && (
          <div className="absolute right-0 top-11 z-10 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <div className="border-b border-gray-100 px-3 py-2 text-xs text-gray-500">
              {email}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ org_name: z.string().trim().min(1).max(120) });

/**
 * Provisions an organization and an owner membership for the current user.
 * Idempotent enough for the signup flow: if the user already has a membership
 * we just return it.
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthenticated", message: "Sign in required." } },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "invalid_input", message: "Organization name required." } },
      { status: 400 }
    );
  }

  // Already onboarded?
  const { data: existing } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ org_id: existing.org_id });
  }

  const { data: org, error: orgErr } = await supabase
    .from("organizations")
    .insert({ name: parsed.data.org_name })
    .select("id")
    .single();
  if (orgErr || !org) {
    return NextResponse.json(
      { error: { code: "server_error", message: "Could not create organization." } },
      { status: 500 }
    );
  }

  const { error: memErr } = await supabase.from("memberships").insert({
    org_id: org.id,
    user_id: user.id,
    role: "owner",
  });
  if (memErr) {
    return NextResponse.json(
      { error: { code: "server_error", message: "Could not create membership." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ org_id: org.id });
}

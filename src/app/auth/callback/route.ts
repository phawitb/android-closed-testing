import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    console.error("Supabase OAuth code exchange failed", error);
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", code ? "exchange" : "callback");
  loginUrl.searchParams.set("next", safeNext);
  return NextResponse.redirect(loginUrl);
}

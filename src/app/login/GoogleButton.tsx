"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleMark } from "@/components/icons";

export function GoogleButton({
  next,
  label = "Continue with Google",
  busyLabel = "Connecting…",
}: {
  next: string;
  label?: string;
  busyLabel?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setError("Could not reach Google. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-6 py-4 text-base font-bold text-ink shadow-sm transition hover:bg-surface-dim disabled:opacity-60"
      >
        <GoogleMark className="h-5 w-5" />
        {loading ? busyLabel : label}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm font-semibold text-brand">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SecondaryButton } from "@/components/ui";

export function SignOutButton({
  label = "Sign out",
  busyLabel = "Signing out…",
}: {
  label?: string;
  busyLabel?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <SecondaryButton
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      {loading ? busyLabel : label}
    </SecondaryButton>
  );
}

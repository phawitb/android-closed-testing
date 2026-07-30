"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Stripe or our webhook can lag a few seconds behind the redirect back here.
 * Reload once so a since-confirmed payment carries the customer straight
 * into the wizard instead of stranding them on a "still confirming" screen.
 */
export function PendingRetry() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.refresh(), 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}

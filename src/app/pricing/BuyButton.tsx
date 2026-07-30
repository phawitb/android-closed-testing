"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, ErrorText } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { startCheckout } from "./actions";

export function BuyButton({
  packageId,
  label,
  busyLabel,
  variant = "primary",
}: {
  packageId: string;
  label: string;
  busyLabel: string;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        variant={variant}
        size="md"
        full
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            // A success never returns — the action redirects to Stripe.
            const result = await startCheckout(packageId);
            if (result?.signIn) {
              router.push("/login?next=%2Fpricing");
              return;
            }
            setError(result?.error ?? null);
          })
        }
      >
        {pending ? busyLabel : label}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </Button>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

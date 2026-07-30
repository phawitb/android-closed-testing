"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ErrorText, PrimaryButton } from "@/components/ui";
import { confirmSetup } from "../actions";

export function CompleteSetupButton({
  appId,
  done,
  label = "I've completed setup",
  doneLabel = "Setup confirmed",
  busyLabel = "Saving…",
}: {
  appId: string;
  done: boolean;
  label?: string;
  doneLabel?: string;
  busyLabel?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <PrimaryButton
        disabled={pending || done}
        onClick={() =>
          startTransition(async () => {
            const result = await confirmSetup(appId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.push(`/dashboard/apps/${appId}`);
            router.refresh();
          })
        }
      >
        {done ? doneLabel : pending ? busyLabel : label}
      </PrimaryButton>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

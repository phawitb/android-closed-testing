"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ErrorText,
  FieldLabel,
  SecondaryButton,
  TextField,
} from "@/components/ui";
import { Lock } from "@/components/icons";
import { normaliseTokenCode } from "@/lib/testing";
import { redeemToken } from "../actions";

export function RedeemForm({
  appId,
  defaultCode = "",
  labels,
}: {
  appId: string;
  defaultCode?: string;
  labels: {
    tokenLabel: string;
    submit: string;
    checking: string;
    tooShort: string;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState(defaultCode);
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = normaliseTokenCode(code);

    if (value.length < 6) {
      setError(labels.tooShort);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await redeemToken(appId, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/dashboard/apps/${appId}/setup`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} noValidate>
      <label className="block">
        <FieldLabel>{labels.tokenLabel}</FieldLabel>
        <TextField
          icon={<Lock className="h-5 w-5" />}
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError(null);
          }}
          placeholder="12TP-XXXX-XXXX"
          autoComplete="off"
          spellCheck={false}
          className="font-mono tracking-wider uppercase"
        />
      </label>
      <ErrorText>{error}</ErrorText>
      <SecondaryButton type="submit" disabled={pending} className="mt-4">
        {pending ? labels.checking : labels.submit}
      </SecondaryButton>
    </form>
  );
}

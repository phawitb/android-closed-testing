"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Card, ErrorText, cn } from "@/components/ui";
import { formatDay } from "@/lib/testing";
import type { AppMessage } from "@/lib/testing";
import type { Dict } from "@/lib/i18n/dictionaries";
import { reportIssue } from "./actions";

export function MessageThread({
  appId,
  initialMessages,
  t,
}: {
  appId: string;
  initialMessages: AppMessage[];
  t: Dict;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await reportIssue(appId, body);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <Card>
      <h3 className="text-sm font-extrabold tracking-wider text-muted uppercase">
        {t.messages.title}
      </h3>
      <p className="mt-1 text-[15px] leading-relaxed text-muted">
        {t.messages.subtitle}
      </p>

      {initialMessages.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{t.messages.empty}</p>
      ) : (
        <ol className="mt-4 max-h-72 space-y-3 overflow-y-auto">
          {initialMessages.map((message) => (
            <li
              key={message.id}
              className={cn(
                "rounded-lg px-3 py-2 text-[14px] leading-relaxed",
                message.sender === "admin"
                  ? "bg-brand-faint text-ink"
                  : "bg-surface-dim text-ink",
              )}
            >
              <p className="text-xs font-extrabold tracking-wider text-muted uppercase">
                {message.sender === "admin" ? t.messages.team : t.messages.you}{" "}
                · {formatDay(message.created_at)}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t.messages.placeholder}
          rows={3}
          className="w-full resize-y rounded-lg border-2 border-brand-tint bg-surface-dim px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-brand"
        />
        <ErrorText>{error}</ErrorText>
        <Button
          onClick={send}
          disabled={pending || !body.trim()}
          variant="secondary"
          size="sm"
          className="mt-2"
        >
          {pending ? t.messages.sending : t.messages.send}
        </Button>
      </div>
    </Card>
  );
}

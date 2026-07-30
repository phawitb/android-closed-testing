import type { ReactNode } from "react";

/**
 * Renders the `**bold**` markers used inside dictionary strings, and fills
 * `{placeholders}` from `values`. Keeps translations as plain strings while
 * still allowing emphasis inside a sentence.
 */
export function RichText({
  text,
  values,
  strongClassName = "text-ink",
}: {
  text: string;
  values?: Record<string, string | number>;
  strongClassName?: string;
}) {
  const filled = values
    ? text.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in values ? String(values[key]) : match,
      )
    : text;

  const parts = filled.split("**");

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className={strongClassName}>
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

/** Same substitution without any markup, for titles and aria labels. */
export function fill(
  text: string,
  values: Record<string, string | number>,
): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function plain(text: string): ReactNode {
  return text.replace(/\*\*/g, "");
}

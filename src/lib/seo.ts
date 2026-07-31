/**
 * JSON-LD is only ever built from our own dictionary strings or database
 * rows here, never raw user input — but `</script>` in a quote could still
 * terminate the tag early, so it's escaped before injection.
 */
export function jsonLd(data: object) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

/**
 * Next.js replaces a segment's whole `openGraph`/`twitter` object rather
 * than merging it with the parent layout's — so a page that only patches
 * `{ url }` silently loses the root layout's title/description/siteName.
 * Every page metadata export builds a complete object through here instead.
 *
 * Deliberately omits the top-level `title` — the root layout's title
 * template appends " — Closed Testing" to whatever a page sets there, so
 * callers add their own short `title` on top of this (or none, to inherit
 * the root default verbatim, e.g. the homepage).
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      siteName: "Closed Testing",
      title,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };
}

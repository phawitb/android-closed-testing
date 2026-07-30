import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowLeft } from "./icons";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
const WIDTHS = {
  /** Single-column forms — still comfortable on a phone. */
  sm: "max-w-[640px]",
  /** Reading width for guides and settings. */
  md: "max-w-3xl",
  /** Two-column app screens. */
  lg: "max-w-5xl",
  /** Dashboards and the wizard. */
  xl: "max-w-6xl",
  /** Marketing pages. */
  full: "max-w-7xl",
} as const;

export type Width = keyof typeof WIDTHS;

/** Full-height page background. Pair with `Container` for the content column. */
export function Page({
  children,
  className,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        glow && "brand-glow",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Container({
  children,
  width = "xl",
  className,
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-10",
        WIDTHS[width],
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Narrow content column. Kept for the screens that are genuinely one column
 * of form — everything wider should use `Page` + `Container`.
 */
export function Screen({
  children,
  className,
  width = "sm",
}: {
  children: ReactNode;
  className?: string;
  width?: Width;
}) {
  return (
    <Page>
      <Container width={width} className={cn("pt-6 pb-28", className)}>
        {children}
      </Container>
    </Page>
  );
}

export function ScreenHeader({
  title,
  backHref,
  action,
  subtitle,
}: {
  title: string;
  backHref?: string;
  action?: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-center gap-3">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Back"
          className="-ml-1 rounded-full p-2 text-ink transition hover:bg-surface-dim"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[15px] text-muted sm:text-base">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}

/** Section heading used down the marketing page and the wide app screens. */
export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-extrabold tracking-[0.16em] text-brand uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-3xl leading-tight font-extrabold text-ink sm:text-4xl">
        {title}
      </h2>
      {body && (
        <p className="mt-3 text-[17px] leading-relaxed text-muted">{body}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------
const VARIANTS = {
  primary:
    "bg-linear-to-r from-brand-strong to-brand text-white shadow-lg shadow-brand/25 hover:brightness-105",
  secondary:
    "border-2 border-brand-tint bg-white text-brand hover:bg-brand-faint",
  dark: "bg-ink text-white hover:brightness-125",
  outline: "border border-line bg-white text-ink hover:bg-surface-dim",
  ghost: "text-brand hover:bg-brand-faint",
} as const;

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[15px]",
  lg: "px-7 py-4 text-base",
} as const;

type ButtonLook = {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  full?: boolean;
};

function buttonClass({ variant = "primary", size = "md", full }: ButtonLook) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition active:scale-[0.99]",
    "disabled:pointer-events-none disabled:bg-none disabled:bg-surface-dim disabled:text-muted disabled:shadow-none",
    VARIANTS[variant],
    SIZES[size],
    full && "w-full",
  );
}

export function Button({
  variant,
  size,
  full,
  className,
  ...props
}: ComponentProps<"button"> & ButtonLook) {
  return (
    <button
      {...props}
      className={cn(buttonClass({ variant, size, full }), className)}
    />
  );
}

export function ButtonLink({
  variant,
  size,
  full,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonLook) {
  return (
    <Link
      {...props}
      className={cn(buttonClass({ variant, size, full }), className)}
    />
  );
}

/** Same look as ButtonLink, for URLs that leave the app. */
export function ButtonAnchor({
  variant,
  size,
  full,
  className,
  ...props
}: ComponentProps<"a"> & ButtonLook) {
  return (
    <a
      {...props}
      className={cn(buttonClass({ variant, size, full }), className)}
    />
  );
}

export function PrimaryButton({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <Button
      {...props}
      variant="primary"
      size="lg"
      full
      className={cn("disabled:cursor-not-allowed", className)}
    />
  );
}

export function PrimaryLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return <ButtonLink {...props} variant="primary" size="lg" full className={className} />;
}

export function SecondaryButton({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <Button
      {...props}
      variant="secondary"
      size="md"
      full
      className={cn("py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-60", className)}
    />
  );
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------
const HAS_BG = /(^|\s)bg-\S/;
const HAS_BORDER_COLOUR =
  /(^|\s)border-(?!(?:\d|[trblxyse]-|solid|dashed|dotted|none)\b)\S/;

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const custom = className ?? "";

  // Tailwind decides between two `bg-*` utilities by stylesheet order, not by
  // the order they appear in the class attribute — so a caller's colours only
  // stick if the defaults are left out entirely.
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm shadow-black/[0.03] sm:p-6",
        !HAS_BG.test(custom) && "bg-surface",
        !HAS_BORDER_COLOUR.test(custom) && "border-line",
        custom,
      )}
    >
      {children}
    </div>
  );
}

export function IconBadge({
  children,
  className,
  size = "md",
  tone = "tint",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Colours live here rather than in `className`, which Tailwind won't override. */
  tone?: "tint" | "solid" | "white";
}) {
  const sizes = {
    sm: "h-9 w-9 rounded-lg",
    md: "h-11 w-11 rounded-xl",
    lg: "h-14 w-14 rounded-xl",
  } as const;

  const tones = {
    tint: "bg-brand-tint text-brand",
    solid: "bg-brand text-white",
    white: "bg-white text-brand",
  } as const;

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({
  label,
  tone = "brand",
}: {
  label: string;
  tone?: "brand" | "muted" | "ok" | "warn";
}) {
  const tones = {
    brand: "bg-brand-tint text-brand",
    muted: "bg-surface-dim text-muted",
    ok: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase",
        tones[tone],
      )}
    >
      {label}
    </span>
  );
}

/** Segmented progress indicator at the top of the submission wizard. */
export function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 rounded-full transition-all",
            index + 1 === step
              ? "flex-[3] bg-brand"
              : index + 1 < step
                ? "flex-1 bg-brand"
                : "flex-1 bg-line",
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form controls
// ---------------------------------------------------------------------------
export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block text-xs font-extrabold tracking-[0.12em] text-brand uppercase">
      {children}
    </span>
  );
}

export function TextField({
  icon,
  className,
  ...props
}: ComponentProps<"input"> & { icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-2 border-brand-tint bg-surface-dim px-4 py-3.5 transition focus-within:border-brand">
      {icon && <span className="shrink-0 text-brand">{icon}</span>}
      <input
        {...props}
        className={cn(
          "w-full bg-transparent text-base text-ink outline-none placeholder:text-muted",
          className,
        )}
      />
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-3 text-sm font-semibold text-brand">
      {children}
    </p>
  );
}

export function NoticeText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="mt-3 text-sm font-semibold text-emerald-700">
      {children}
    </p>
  );
}

/**
 * Action bar. Fixed to the bottom of the viewport on phones, an ordinary block
 * on desktop where there is room for it in the flow.
 */
export function Sticky({
  children,
  className,
  width = "sm",
}: {
  children: ReactNode;
  className?: string;
  width?: Width;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-background/90 px-5 pt-4 pb-5 backdrop-blur sm:px-8",
        "lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0 lg:backdrop-blur-none",
        className,
      )}
    >
      <div className={cn("mx-auto w-full lg:max-w-none", WIDTHS[width])}>
        {children}
      </div>
    </div>
  );
}

import Link from "next/link";
import { cn } from "./ui";

/** Segmented switch so admins can flip between the normal app and the admin console. */
export function ModeToggle({
  active,
  userLabel = "My Apps",
  adminLabel = "Admin",
  className,
}: {
  active: "user" | "admin";
  userLabel?: string;
  adminLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-surface-dim p-1",
        className,
      )}
    >
      <Link
        href="/dashboard"
        aria-current={active === "user" ? "page" : undefined}
        className={cn(
          "rounded-full px-3 py-1.5 text-sm font-bold whitespace-nowrap transition",
          active === "user"
            ? "bg-white text-ink shadow-sm"
            : "text-muted hover:text-ink",
        )}
      >
        {userLabel}
      </Link>
      <Link
        href="/admin"
        aria-current={active === "admin" ? "page" : undefined}
        className={cn(
          "rounded-full px-3 py-1.5 text-sm font-bold whitespace-nowrap transition",
          active === "admin"
            ? "bg-white text-ink shadow-sm"
            : "text-muted hover:text-ink",
        )}
      >
        {adminLabel}
      </Link>
    </div>
  );
}

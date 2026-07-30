"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/apps", label: "Submissions" },
  { href: "/admin/tokens", label: "Tokens & Packages" },
  { href: "/admin/team", label: "Admins" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {LINKS.map(({ href, label }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition",
              active
                ? "bg-ink text-white"
                : "text-muted hover:bg-surface-dim hover:text-ink",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, Screen } from "@/components/ui";
import { Lock } from "@/components/icons";
import { AdminShell } from "./AdminShell";
import { SignOutButton } from "../dashboard/settings/SignOutButton";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: isAdmin, error } = await supabase.rpc("ct_is_admin");

  if (error) {
    return (
      <Screen className="flex min-h-screen flex-col justify-center">
        <Card className="border-brand-tint bg-brand-faint">
          <p className="text-sm leading-relaxed font-semibold text-brand">
            Could not check admin access: {error.message}. Make sure both SQL
            migrations in <code>supabase/migrations</code> have been applied.
          </p>
        </Card>
      </Screen>
    );
  }

  if (!isAdmin) {
    return (
      <Screen className="flex min-h-screen flex-col justify-center pb-10">
        <Card className="ct-pop">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-tint text-brand">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink">
            No admin access
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            You are signed in as{" "}
            <strong className="text-ink">{user.email}</strong>, which is not on
            the admin list. Ask an existing admin to add this address, or sign
            in with a different Google account.
          </p>

          <div className="mt-6 space-y-3">
            <SignOutButton />
            <Link
              href="/dashboard"
              className="block rounded-full px-6 py-3 text-center text-base font-bold text-brand transition hover:bg-brand-faint"
            >
              Back to My Apps
            </Link>
          </div>
        </Card>
      </Screen>
    );
  }

  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}

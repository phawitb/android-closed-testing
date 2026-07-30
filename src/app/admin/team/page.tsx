import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { TeamManager } from "./TeamManager";
import type { AdminAccount } from "../types";

export default async function AdminTeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("ct_admin_list_admins");
  const admins = (data ?? []) as AdminAccount[];

  if (error) {
    return (
      <Card className="border-brand-tint bg-brand-faint">
        <p className="text-sm font-semibold text-brand">
          Could not load admins: {error.message}
        </p>
      </Card>
    );
  }

  return <TeamManager admins={admins} currentEmail={user?.email ?? ""} />;
}

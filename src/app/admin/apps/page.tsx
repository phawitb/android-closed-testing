import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { AdminAppCard } from "../AdminAppCard";
import type { AdminApp } from "../types";
import type { AppMessage } from "@/lib/testing";

export default async function AdminAppsPage() {
  const supabase = await createClient();
  const [{ data, error }, { data: messageRows }] = await Promise.all([
    supabase.rpc("ct_admin_apps"),
    supabase
      .from("ct_app_messages")
      .select("*")
      .order("created_at"),
  ]);

  const apps = (data ?? []) as AdminApp[];
  const messages = (messageRows ?? []) as AppMessage[];

  const messagesByApp = new Map<string, AppMessage[]>();
  for (const message of messages) {
    const list = messagesByApp.get(message.app_id) ?? [];
    list.push(message);
    messagesByApp.set(message.app_id, list);
  }

  function needsAction(app: AdminApp) {
    const thread = messagesByApp.get(app.id);
    const waitingOnOwnerReply = thread?.at(-1)?.sender === "owner";
    const readyToStart = app.status === "awaiting_setup" && app.setup_confirmed_at;
    return Boolean(readyToStart || waitingOnOwnerReply);
  }

  const sortedApps = [...apps].sort((a, b) => {
    const diff = Number(needsAction(b)) - Number(needsAction(a));
    if (diff !== 0) return diff;
    return b.created_at.localeCompare(a.created_at);
  });

  return (
    <div>
      <h2 className="mb-4 text-lg font-extrabold text-ink">
        Submissions ({apps.length})
      </h2>

      {error && (
        <Card className="mb-4 border-brand-tint bg-brand-faint">
          <p className="text-sm font-semibold text-brand">
            Could not load submissions: {error.message}
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {sortedApps.map((app) => (
          <AdminAppCard
            key={app.id}
            app={app}
            messages={messagesByApp.get(app.id) ?? []}
            needsAction={needsAction(app)}
          />
        ))}
        {apps.length === 0 && !error && (
          <Card className="py-10 text-center text-muted">
            No submissions yet.
          </Card>
        )}
      </div>
    </div>
  );
}

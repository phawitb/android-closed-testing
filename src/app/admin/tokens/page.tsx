import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { getSettings } from "@/lib/settings.server";
import { PackageManager } from "./PackageManager";
import { TokenIssuer, TokenList } from "./TokenManager";
import type { AdminPackage, AdminToken } from "../types";

export default async function AdminTokensPage() {
  const supabase = await createClient();

  const [packagesResult, tokensResult, settings] = await Promise.all([
    supabase.rpc("ct_admin_packages"),
    supabase.rpc("ct_admin_tokens"),
    getSettings(),
  ]);

  const packages = (packagesResult.data ?? []) as AdminPackage[];
  const tokens = (tokensResult.data ?? []) as AdminToken[];
  const error = packagesResult.error ?? tokensResult.error;

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-brand-tint bg-brand-faint">
          <p className="text-sm font-semibold text-brand">
            Could not load data: {error.message}
          </p>
        </Card>
      )}

      <PackageManager
        packages={packages}
        defaultCurrency={settings.defaultCurrency}
      />
      <TokenIssuer packages={packages.filter((p) => p.is_active)} />
      <TokenList tokens={tokens} />
    </div>
  );
}

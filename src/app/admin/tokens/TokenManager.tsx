"use client";

import { useActionState, useState } from "react";
import { Card, ErrorText, StatusPill } from "@/components/ui";
import { CopyField } from "@/components/CopyField";
import { createTokens, voidToken, type AdminState } from "../actions";
import type { AdminPackage, AdminToken } from "../types";

const input =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand";

export function TokenIssuer({ packages }: { packages: AdminPackage[] }) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    createTokens,
    {},
  );
  const [packageId, setPackageId] = useState("");
  const [count, setCount] = useState(1);

  const selected = packages.find((p) => p.id === packageId);
  // A package fixes the amount; otherwise the admin picks it.
  const effectiveCount = selected ? selected.token_count : count;

  return (
    <Card>
      <h2 className="text-lg font-extrabold text-ink">Issue tokens</h2>
      <p className="mt-1 text-sm text-muted">
        Send these to a customer after they pay. Each token activates one app.
      </p>

      <form action={formAction} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted">
              From package
            </span>
            <select
              name="package_id"
              value={packageId}
              onChange={(event) => setPackageId(event.target.value)}
              className={input}
            >
              <option value="">— custom amount —</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.token_count})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted">
              How many
            </span>
            <input
              type="number"
              name="count"
              min={1}
              max={100}
              value={effectiveCount}
              onChange={(event) => setCount(Number(event.target.value) || 1)}
              readOnly={Boolean(selected)}
              className={`${input} read-only:bg-surface-dim read-only:text-muted`}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted">
              Issue to (optional)
            </span>
            <input
              name="email"
              type="email"
              placeholder="customer@example.com"
              className={input}
            />
          </label>
        </div>

        <ErrorText>{state.error}</ErrorText>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {pending
            ? "Creating…"
            : `Issue ${effectiveCount} token${effectiveCount === 1 ? "" : "s"}`}
        </button>
      </form>

      {state.codes && state.codes.length > 0 && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-extrabold text-emerald-700">
            {state.notice} Copy them now.
          </p>
          <div className="mt-3 space-y-2">
            {state.codes.map((code) => (
              <CopyField key={code} value={code} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function TokenList({ tokens }: { tokens: AdminToken[] }) {
  const [state, formAction] = useActionState<AdminState, FormData>(
    voidToken,
    {},
  );

  return (
    <Card>
      <h2 className="text-lg font-extrabold text-ink">
        Tokens ({tokens.length})
      </h2>
      <ErrorText>{state.error}</ErrorText>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-bold text-muted uppercase">
              <th className="pb-2">Code</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Package</th>
              <th className="pb-2">Issued to</th>
              <th className="pb-2">Used for</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.id} className="border-b border-line/60">
                <td className="py-2.5 font-mono text-ink">{token.code}</td>
                <td className="py-2.5">
                  <StatusPill
                    label={token.status}
                    tone={
                      token.status === "unused"
                        ? "brand"
                        : token.status === "used"
                          ? "ok"
                          : "muted"
                    }
                  />
                </td>
                <td className="py-2.5 text-muted">
                  {token.package_name ?? "—"}
                </td>
                <td className="py-2.5 text-muted">
                  {token.issued_to_email ?? "—"}
                </td>
                <td className="py-2.5 text-muted">
                  {token.redeemed_app_name ?? "—"}
                </td>
                <td className="py-2.5 text-right">
                  {token.status === "unused" && (
                    <form action={formAction}>
                      <input type="hidden" name="token_id" value={token.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-muted transition hover:border-brand hover:text-brand"
                      >
                        Void
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {tokens.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted">
                  No tokens yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

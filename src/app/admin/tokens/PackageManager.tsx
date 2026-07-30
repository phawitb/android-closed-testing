"use client";

import { useActionState, useState } from "react";
import { Card, ErrorText, cn } from "@/components/ui";
import { Plus } from "@/components/icons";
import { deletePackage, savePackage, type AdminState } from "../actions";
import { formatPrice, type AdminPackage } from "../types";

const input =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand";

export function PackageManager({
  packages,
  defaultCurrency,
}: {
  packages: AdminPackage[];
  defaultCurrency: string;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <Card>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-ink">Token packages</h2>
          <p className="text-sm text-muted">
            What you sell. Issuing from a package mints its whole token count at
            once.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating((v) => !v);
            setEditing(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:brightness-125"
        >
          <Plus className="h-4 w-4" />
          {creating ? "Close" : "New package"}
        </button>
      </div>

      {creating && (
        <div className="mt-4 rounded-lg border border-line p-4">
          <PackageForm
            defaultCurrency={defaultCurrency}
            onDone={() => setCreating(false)}
          />
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {packages.map((pkg) => (
          <li
            key={pkg.id}
            className={cn(
              "rounded-lg border p-4",
              pkg.is_active ? "border-line" : "border-dashed border-line bg-surface-dim",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-extrabold text-ink">
                  {pkg.name}
                  {!pkg.is_active && (
                    <span className="ml-2 rounded-full bg-surface-dim px-2 py-0.5 text-xs font-bold text-muted">
                      hidden
                    </span>
                  )}
                </p>
                {pkg.description && (
                  <p className="mt-0.5 text-sm text-muted">{pkg.description}</p>
                )}
                <p className="mt-1 text-sm text-muted">
                  {pkg.token_count} token{pkg.token_count === 1 ? "" : "s"} ·{" "}
                  {formatPrice(pkg.price_cents, pkg.currency)} ·{" "}
                  {pkg.issued_count} issued
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(editing === pkg.id ? null : pkg.id);
                    setCreating(false);
                  }}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-muted transition hover:border-brand hover:text-brand"
                >
                  {editing === pkg.id ? "Close" : "Edit"}
                </button>
                <DeleteButton id={pkg.id} disabled={pkg.issued_count > 0} />
              </div>
            </div>

            {editing === pkg.id && (
              <div className="mt-4 border-t border-line pt-4">
                <PackageForm
                  pkg={pkg}
                  defaultCurrency={defaultCurrency}
                  onDone={() => setEditing(null)}
                />
              </div>
            )}
          </li>
        ))}
        {packages.length === 0 && (
          <li className="py-6 text-center text-muted">No packages yet.</li>
        )}
      </ul>
    </Card>
  );
}

function PackageForm({
  pkg,
  defaultCurrency,
  onDone,
}: {
  pkg?: AdminPackage;
  defaultCurrency: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    async (prev, formData) => {
      const result = await savePackage(prev, formData);
      if (!result.error) onDone();
      return result;
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      {pkg && <input type="hidden" name="package_id" value={pkg.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted">Name</span>
          <input
            name="name"
            defaultValue={pkg?.name ?? ""}
            placeholder="Studio Pack"
            className={input}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted">
            Description
          </span>
          <input
            name="description"
            defaultValue={pkg?.description ?? ""}
            placeholder="Five tokens for five apps."
            className={input}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted">
            Tokens
          </span>
          <input
            type="number"
            name="token_count"
            min={1}
            max={100}
            defaultValue={pkg?.token_count ?? 1}
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted">Price</span>
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            defaultValue={((pkg?.price_cents ?? 0) / 100).toFixed(2)}
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted">
            Currency
          </span>
          <input
            name="currency"
            maxLength={3}
            defaultValue={pkg?.currency ?? defaultCurrency}
            className={cn(input, "uppercase")}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted">
            Sort order
          </span>
          <input
            type="number"
            name="sort_order"
            defaultValue={pkg?.sort_order ?? 0}
            className={input}
          />
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
        <input
          type="checkbox"
          name="is_active"
          value="1"
          defaultChecked={pkg?.is_active ?? true}
          className="accent-[var(--brand)]"
        />
        Show on the pricing page
      </label>

      <ErrorText>{state.error}</ErrorText>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Saving…" : pkg ? "Save package" : "Create package"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-muted transition hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeleteButton({ id, disabled }: { id: string; disabled: boolean }) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    deletePackage,
    {},
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="package_id" value={id} />
      <button
        type="submit"
        disabled={pending || disabled}
        title={
          disabled
            ? "Tokens have already been issued from this package"
            : undefined
        }
        className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "…" : "Delete"}
      </button>
      {state.error && (
        <span className="mt-1 block text-xs font-semibold text-brand">
          {state.error}
        </span>
      )}
    </form>
  );
}

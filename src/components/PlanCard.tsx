import type { ReactNode } from "react";
import { PLAN } from "@/lib/testing";
import { Check, ShieldCheck } from "./icons";

export type PlanCopy = {
  name: string;
  tagline: string;
  badge: string;
  features: readonly string[];
};

/** The purple→pink plan card from the Plans & Pricing screen. */
export function PlanCard({
  copy,
  action,
  showPrice = true,
}: {
  copy: PlanCopy;
  action?: ReactNode;
  showPrice?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-linear-to-b from-[var(--grad-from)] to-[var(--grad-to)] p-6 text-white shadow-xl shadow-brand/20 sm:p-8">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
          {copy.badge}
        </span>
        <ShieldCheck className="h-5 w-5" />
      </div>

      <h3 className="mt-5 text-3xl font-extrabold">{copy.name}</h3>
      <p className="text-lg text-white/70">{copy.tagline}</p>

      {showPrice && (
        <p className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-5xl font-extrabold">
            {PLAN.priceLabel}
          </span>
          <span className="text-xl font-bold text-white/60">{PLAN.unit}</span>
        </p>
      )}

      <ul className="mt-6 space-y-3.5">
        {copy.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-[17px] leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}

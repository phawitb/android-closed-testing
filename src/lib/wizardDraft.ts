export const WIZARD_DRAFT_STORAGE_KEY = "ct-submit-wizard";

/**
 * True once the customer has verified a token and moved past step 1 of the
 * submit wizard — worth resuming ("Continue") rather than restarting
 * ("Add New App"). Client-only: localStorage isn't available during SSR.
 */
export function hasWizardDraftInProgress(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(WIZARD_DRAFT_STORAGE_KEY);
    if (!saved) return false;
    const draft = JSON.parse(saved) as { step?: number };
    return typeof draft.step === "number" && draft.step > 1;
  } catch {
    return false;
  }
}

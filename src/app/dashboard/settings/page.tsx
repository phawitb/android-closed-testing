import { redirect } from "next/navigation";

/**
 * Settings is a modal now (see AppHeader's gear icon → SettingsModal), not a
 * standalone page. This route only exists so old bookmarks/links don't 404.
 */
export default function SettingsPage() {
  redirect("/dashboard");
}

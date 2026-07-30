"use client";

import { useEffect, useState } from "react";
import { X } from "./icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports as "MacIntel" but is touch-capable, unlike a Mac.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Mobile-only install nudge. Android/Chrome gets the native install dialog
 * triggered automatically; iOS Safari has no such API, so it gets a small
 * banner pointing at Share → Add to Home Screen instead.
 */
export function InstallPrompt({
  iosTitle,
  iosBody,
  close,
}: {
  iosTitle: string;
  iosBody: string;
  close: string;
}) {
  const [showIos, setShowIos] = useState(false);

  // One-shot check on mount, not a loop: is this device eligible, and is it
  // iOS (which has no beforeinstallprompt, so it needs the custom banner).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isMobileDevice() || isStandalone()) return;

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      void (event as BeforeInstallPromptEvent).prompt();
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    if (isIOS()) setShowIos(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!showIos) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-xl shadow-black/10 sm:right-4 sm:left-auto sm:max-w-sm">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-ink">{iosTitle}</p>
        <p className="mt-1 text-[13px] leading-snug text-muted">{iosBody}</p>
      </div>
      <button
        type="button"
        aria-label={close}
        onClick={() => setShowIos(false)}
        className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-surface-dim hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

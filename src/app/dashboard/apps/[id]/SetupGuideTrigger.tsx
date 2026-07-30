"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { SetupGuideModal } from "@/components/SetupGuideModal";
import type { Dict } from "@/lib/i18n/dictionaries";

export function SetupGuideTrigger({
  appId,
  done,
  primary,
  t,
}: {
  appId: string;
  done: boolean;
  primary: boolean;
  t: Dict;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={primary ? "primary" : "outline"}
        size="md"
        onClick={() => setOpen(true)}
      >
        {done ? t.appDetails.reviewSetup : t.appDetails.openSetup}
      </Button>

      <SetupGuideModal
        open={open}
        onClose={() => setOpen(false)}
        appId={appId}
        done={done}
        t={t}
      />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { hasWizardDraftInProgress } from "@/lib/wizardDraft";
import type { Dict } from "@/lib/i18n/dictionaries";

/** Same CTA as AppHeader's, but inline on the My Apps page for lg screens. */
export function SubmitAppButton({
  t,
  className,
}: {
  t: Dict;
  className?: string;
}) {
  const [resumingWizard, setResumingWizard] = useState(false);
  // localStorage doesn't exist during SSR, so this can only run post-mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setResumingWizard(hasWizardDraftInProgress());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <ButtonLink
      href="/dashboard/apps/new"
      variant="primary"
      size="md"
      className={className}
    >
      {resumingWizard ? t.common.continueApp : t.common.submitApp}
      <ArrowRight className="h-4 w-4" />
    </ButtonLink>
  );
}

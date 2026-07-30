import { Card, IconBadge, cn } from "./ui";
import { CopyField } from "./CopyField";
import { GuideShot } from "./GuideShot";
import { RichText } from "./RichText";
import { ExternalLink } from "./icons";
import { TESTER_GROUP_EMAIL } from "@/lib/testing";
import type { Dict } from "@/lib/i18n/dictionaries";

export type SetupCopy = Dict["setupGuide"];
export type CopyLabels = Dict["copy"];

const IMAGES = [
  {
    src: "/guide/2.png",
    alt: "Countries / regions tab with All countries / regions selected",
  },
  {
    src: "/guide/3.png",
    alt: "Testers tab with Google Groups selected and the tester group email added",
    copy: TESTER_GROUP_EMAIL,
  },
  {
    src: "/guide/4.png",
    alt: "Advanced settings, App availability set to Published",
  },
  {
    src: "/guide/5.png",
    alt: "Publishing overview with the Send changes for review button highlighted",
  },
];

export const SETUP_STEP_COUNT = IMAGES.length;

/** "Before you begin" — the Play Console screens to open first. */
export function SetupIntro({
  t,
  className,
}: {
  t: SetupCopy;
  className?: string;
}) {
  return (
    <Card className={cn("border-brand-tint bg-brand-faint", className)}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold tracking-[0.16em] text-brand uppercase">
            {t.beforeYouBegin}
          </p>
          <h3 className="mt-2 text-2xl font-extrabold text-ink">
            {t.introTitle}
          </h3>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-ink-soft">
            {[t.intro1, t.intro2, t.intro3].map((line, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-bold text-brand">{index + 1}.</span>
                <span>
                  <RichText text={line} />
                </span>
              </li>
            ))}
          </ul>

          <a
            href="https://play.google.com/console"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-brand-tint bg-white px-5 py-2.5 text-sm font-bold text-brand transition hover:bg-brand-faint"
          >
            <ExternalLink className="h-4 w-4" />
            {t.openConsole}
          </a>
        </div>

        <GuideShot
          src="/guide/1.png"
          alt="Google Play Console with Test and release and Closed testing highlighted"
          className="lg:w-[46%] lg:shrink-0"
        />
      </div>
    </Card>
  );
}

/** The four mandatory Play Console steps, two-up on desktop. */
export function SetupSteps({
  t,
  copy,
  className,
}: {
  t: SetupCopy;
  copy: CopyLabels;
  className?: string;
}) {
  return (
    <ol className={cn("grid gap-4 lg:grid-cols-2", className)}>
      {t.steps.map((step, index) => {
        const image = IMAGES[index];

        return (
          <li key={step.title}>
            <Card className="flex h-full flex-col">
              <div className="flex items-center gap-3">
                <IconBadge size="sm" tone="solid">
                  <span className="text-sm font-extrabold">{index + 1}</span>
                </IconBadge>
                <h3 className="text-lg font-extrabold text-ink sm:text-xl">
                  {step.title}
                </h3>
              </div>

              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                <RichText text={step.body} strongClassName="text-brand" />
              </p>

              {image?.copy && (
                <div className="mt-4">
                  <CopyField
                    value={image.copy}
                    label={t.groupEmail}
                    hint={copy.clickToCopy}
                    copiedLabel={copy.copied}
                  />
                </div>
              )}

              {image && (
                <GuideShot
                  src={image.src}
                  alt={image.alt}
                  className="mt-4 lg:mt-auto lg:pt-4"
                />
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}

import type { AppNavLabels } from "@/components/AppHeader";
import type { SiteNavLabels } from "@/components/SiteHeader";
import type { Dict } from "./dictionaries";

/** The header slices, so pages don't ship the whole dictionary to the client. */
export function appNav(t: Dict): AppNavLabels {
  return {
    myApps: t.common.myApps,
    submitApp: t.common.submitApp,
    plans: t.common.plans,
    settings: t.common.settings,
    admin: t.common.admin,
    menu: t.common.menu,
  };
}

export function siteNav(t: Dict): SiteNavLabels {
  return {
    how: t.landing.nav.how,
    rule: t.landing.nav.rule,
    included: t.landing.nav.included,
    pricing: t.landing.nav.pricing,
    faq: t.landing.nav.faq,
    signIn: t.common.signIn,
    getStarted: t.common.getStarted,
    myApps: t.common.myApps,
    menu: t.common.menu,
  };
}

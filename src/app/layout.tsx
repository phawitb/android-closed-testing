import type { Metadata, Viewport } from "next";
import { Kanit, Plus_Jakarta_Sans, Quicksand } from "next/font/google";
import { getT } from "@/lib/i18n/server";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { jsonLd } from "@/lib/seo";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const body = Quicksand({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Modern Thai sans — Quicksand/Plus Jakarta Sans have no Thai glyphs, so
 * this is the fallback the browser reaches for any Thai character. */
const thai = Kanit({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

const siteDescription =
  "Submit your Android app for a 14-day Google Play closed testing cycle and track every day of progress.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Closed Testing — 14 days of Google Play closed testing",
    template: "%s — Closed Testing",
  },
  description: siteDescription,
  applicationName: "Closed Testing",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    siteName: "Closed Testing",
    title: "Closed Testing — 14 days of Google Play closed testing",
    description: siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Closed Testing — 14 days of Google Play closed testing",
    description: siteDescription,
  },
  verification: {
    google: "57VtPxFf3ohQKBCnVjeq4rQ_nE7Uy9_E-XKZhMPpeso",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Closed Testing",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Closed Testing",
  url: siteUrl,
  logo: `${siteUrl}/icons/icon-512.png`,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Closed Testing",
  url: siteUrl,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale, t } = await getT();

  return (
    <html lang={locale}>
      <body
        className={`${display.variable} ${body.variable} ${thai.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(organizationJsonLd)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(websiteJsonLd)}
        />
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt
          iosTitle={t.pwa.iosTitle}
          iosBody={t.pwa.iosBody}
          close={t.pwa.close}
        />
      </body>
    </html>
  );
}

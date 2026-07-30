import type { Metadata, Viewport } from "next";
import { Kanit, Plus_Jakarta_Sans, Quicksand } from "next/font/google";
import { getLocale } from "@/lib/i18n/server";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
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

export const metadata: Metadata = {
  title: "Closed Testing",
  description:
    "Submit your Android app for a 14-day Google Play closed testing cycle and track every day of progress.",
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${display.variable} ${body.variable} ${thai.variable} antialiased`}
      >
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

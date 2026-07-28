import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import {
  PLATFORM_BRAND_DESCRIPTION,
  PLATFORM_BRAND_NAME,
} from "@/lib/platform-brand";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: PLATFORM_BRAND_NAME,
    template: `%s - ${PLATFORM_BRAND_NAME}`,
  },
  description: PLATFORM_BRAND_DESCRIPTION,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#f6f8f5]">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

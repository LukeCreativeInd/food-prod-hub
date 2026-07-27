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
  title: PLATFORM_BRAND_NAME,
  description: PLATFORM_BRAND_DESCRIPTION,
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

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Clean Eats Hub",
  description: "Internal food operations platform for Clean Eats.",
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

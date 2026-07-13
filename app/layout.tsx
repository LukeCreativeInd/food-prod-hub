import type { Metadata } from "next";
import type { ReactNode } from "react";
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
        <SpeedInsights />
      </body>
    </html>
  );
}

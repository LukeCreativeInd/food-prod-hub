import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
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
      <body>
        <div className="flex min-h-screen flex-col bg-[#f6f8f5] md:flex-row">
          <AppSidebar />
          <main className="min-w-0 flex-1 bg-[#f6f8f5]">{children}</main>
        </div>
      </body>
    </html>
  );
}

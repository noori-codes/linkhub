import type { Metadata } from "next";

import { AppToaster } from "@/components/AppToaster";
import { Providers } from "@/components/Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LinkHub — one public page for your links",
    template: "%s · LinkHub",
  },
  description:
    "Draft privately, then publish a page for your links, design, and shop — one URL for everything you share.",
  icons: {
    icon: "/linkhub-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
        <AppToaster />
      </body>
    </html>
  );
}

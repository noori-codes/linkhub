import type { Metadata } from "next";

import { AppToaster } from "@/components/AppToaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LinkHub",
    template: "%s · LinkHub",
  },
  description:
    "Your identity and links in one place — between a profile and a link page.",
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
        {children}
        <AppToaster />
      </body>
    </html>
  );
}

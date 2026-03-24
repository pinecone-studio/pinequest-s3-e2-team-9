import type { Metadata } from "next";
import { AppProviders } from "./app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pinequest Team 9",
  description: "Bootstrapped with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

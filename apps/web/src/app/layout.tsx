import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import "./globals.css";
import { ApolloAppProvider } from "@/components/apollo-provider";
import { ClerkSignOutFix } from "@/app/components/clerk-sign-out-fix";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
      <body className={geist.className}>
        <ClerkProvider
          afterSignOutUrl="/sign-in"
          signInUrl="/sign-in"
          signInFallbackRedirectUrl="/"
          signUpUrl="/sign-up"
          signUpFallbackRedirectUrl="/"
        >
          <ClerkSignOutFix />
          <ApolloAppProvider>{children}</ApolloAppProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ApolloAppProvider } from "@/components/apollo-provider";
import { ClerkSignOutFix } from "@/app/components/clerk-sign-out-fix";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
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
      <body className={`${geist.className} ${geist.variable} ${inter.variable} ${poppins.variable}`}>
        <ClerkProvider
          afterSignOutUrl="/sign-in"
          signInUrl="/sign-in"
          signInFallbackRedirectUrl="/"
          signUpUrl="/sign-in"
          signUpFallbackRedirectUrl="/sign-in"
        >
          <ClerkSignOutFix />
          <ApolloAppProvider>{children}</ApolloAppProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

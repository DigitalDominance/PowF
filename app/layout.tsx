// app/layout.tsx

import * as React from "react";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/custom/header";
import { Footer } from "@/components/custom/footer";
import { Toaster } from "sonner";
import { AnimatedBackground } from "@/components/custom/animated-background";

// 1) Import AppKitProvider so ConnectButton can use useAppKitAccount, useAppKit
import { AppKitProvider } from "@/lib/appkit";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300","400","500","600","700","800","900"],
  display: "swap"
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased min-h-screen flex flex-col bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={true}
        >
          {/* 2) Wrap entire app in AppKitProvider so wallet hooks work */}
          <AppKitProvider>
            <AnimatedBackground />
            <Header />
            <main className="flex-1 relative z-10">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
          </AppKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

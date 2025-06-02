import * as React from "react"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Header } from "@/components/custom/header"
import { Footer } from "@/components/custom/footer"
import { Toaster } from "sonner"
import { AnimatedBackground } from "@/components/custom/animated-background"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
// Initialize Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins", // CSS variable for this font
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Include desired weights
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className={`font-sans antialiased min-h-screen flex flex-col bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={true}
        >
          <AnimatedBackground />
          <Header />
          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}

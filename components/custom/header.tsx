"use client"

import Link from "next/link"
import { Briefcase, Users, ShieldCheck, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useState } from "react"
import { motion } from "framer-motion"
import { ConnectWallet } from "./connect-wallet"
import { ThemeSwitch } from "./theme-switch"

const navItems = [
  { name: "Find Work", href: "/jobs", icon: <Briefcase className="h-5 w-5" /> },
  { name: "Post a Job", href: "/post-job", icon: <Users className="h-5 w-5" /> },
  { name: "Disputes", href: "/disputes", icon: <ShieldCheck className="h-5 w-5" /> },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        {" "}
        {/* Reduced header height for mobile friendliness */}
        {/* Logo and Company Name - adjusted for mobile */}
        <Link href="/" className="flex items-center gap-1.5 group shrink-0">
          {" "}
          {/* Added shrink-0 */}
          <motion.svg
            width="28" // Reduced size for mobile, md:width="36" for desktop
            height="28" // Reduced size for mobile, md:height="36" for desktop
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-accent group-hover:animate-pulse-glow md:w-9 md:h-9" // Responsive size
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              fill="currentColor"
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </motion.svg>
          <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors md:text-2xl">
            {" "}
            {/* Responsive text size */}
            Proof Of Works
          </span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <Link
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent flex items-center gap-2 group"
              >
                <span className="group-hover:text-accent transition-colors">{item.icon}</span>
                {item.name}
              </Link>
            </motion.div>
          ))}
          <ConnectWallet />
          <ThemeSwitch />
        </nav>
        {/* Mobile Navigation Controls */}
        <div className="md:hidden flex items-center gap-1.5">
          {" "}
          {/* Reduced gap */}
          <ConnectWallet buttonSize="sm" /> {/* Pass sm size for mobile */}
          <ThemeSwitch size="sm" /> {/* Pass sm size for mobile */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-1">
                {" "}
                {/* Reduced margin */}
                <Menu className="h-5 w-5 text-accent" /> {/* Slightly smaller menu icon */}
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm glass-effect">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.svg // Mobile sheet logo
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-accent"
                    >
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                    <span className="text-xl font-bold text-foreground">Proof Of Works</span>
                  </Link>
                  {/* Default SheetClose is part of SheetContent */}
                </div>
                <nav className="flex flex-col gap-6">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className="text-lg font-medium text-muted-foreground transition-colors hover:text-accent flex items-center gap-3 p-2 rounded-md hover:bg-accent/10"
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-auto pt-6 border-t border-border/40">
                  <p className="text-xs text-muted-foreground text-center">
                    &copy; {new Date().getFullYear()} Proof Of Works
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

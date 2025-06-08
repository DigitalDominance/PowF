"use client"

import Link from "next/link"
import { Briefcase, Users, ShieldCheck, Menu, X } from "lucide-react"
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
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-accent group-hover:animate-pulse-glow"
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
          <span className="text-2xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
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

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <ConnectWallet />
          <div className="ml-2">
            <ThemeSwitch />
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Menu className="h-6 w-6 text-accent" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] glass-effect">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.svg
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
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-6 w-6 text-accent" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
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

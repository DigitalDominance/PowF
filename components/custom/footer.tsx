"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

export function Footer() {
  const socialLinks = [
    {
      name: "Telegram",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.58 7.44c-.12.539-.432.672-.864.42l-2.388-1.764-1.152 1.116c-.128.128-.236.236-.48.236l.168-2.388 4.332-3.912c.192-.168-.036-.264-.3-.096l-5.364 3.372-2.304-.72c-.504-.156-.516-.504.108-.744l9-3.456c.42-.156.792.096.66.744z" />
        </svg>
      ),
      href: "#",
    },
    {
      name: "X",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: "#",
    },
  ]

  const footerLinks = [
    { name: "About Us", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Documentation", href: "#" },
  ]

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="border-t border-border/40 bg-background/80"
    >
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <motion.div className="relative h-16 w-auto" whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                {/* Dark mode logo (default) */}
                <Image
                  src="/powlogodarkmode.webp"
                  alt="Proof of Works Logo"
                  width={240}
                  height={64}
                  className="object-contain h-16 w-auto dark:block hidden"
                />
                {/* Light mode logo */}
                <Image
                  src="/powlogolightmode.webp"
                  alt="Proof of Works Logo"
                  width={240}
                  height={64}
                  className="object-contain h-16 w-auto dark:hidden block"
                />
              </motion.div>
            </Link>
            <p className="text-sm text-muted-foreground font-varien tracking-wider">
              Revolutionizing hiring with on-chain transparency and trust.
            </p>
          </div>
          <div>
            <h3 className="text-md font-semibold text-foreground mb-4 font-varien tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors font-varien tracking-wider"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold text-foreground mb-4 font-varien tracking-wider">Connect With Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                  aria-label={link.name}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6 font-varien tracking-wider">Built on Kaspa's EVM Layer.</p>
          </div>
        </div>
        <div className="border-t border-border/40 pt-8 text-center">
          <p className="text-sm text-muted-foreground font-varien tracking-wider">
            &copy; {new Date().getFullYear()} Proof Of Works. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}

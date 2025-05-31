"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { useEffect } from 'react';
import { ConnectButton } from '@/components/ConnectButton';
import { initAppKit } from '@/lib/appkit';

import {
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Zap,
  Lock,
  FileText,
  Briefcase,
  Layers,
  GitBranch,
  Scale,
  Users2,
  Landmark,
  Handshake,
  Share2,
  LinkIcon,
  Cpu,
} from "lucide-react"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import { InteractiveCard } from "@/components/custom/interactive-card"
import { ChangeNowWidget } from "@/components/custom/change-now-widget"
import { Balancer } from "react-wrap-balancer"

const fadeIn = (delay = 0, duration = 0.5) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay, duration, ease: "easeOut" } },
})

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

const SectionWrapper = ({
  children,
  className,
  id,
  padding = "py-16 md:py-20 lg:py-24",
}: {
  children: React.ReactNode
  className?: string
  id?: string
  padding?: string
}) => (
  <section id={id} className={`w-full relative ${padding} ${className}`}>
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/3 dark:via-black/5 to-transparent opacity-20" />
    <div className="container px-4 md:px-6 relative z-10">{children}</div>
  </section>
)

export default function Home() {
  useEffect(() => {
    initAppKit();
  }, []);

  const coreValues = [
    {
      icon: <Layers className="h-8 w-8 text-accent" />,
      title: "Full On-Chain Transparency",
      description:
        "Every job term, fund lock, payment, and reputation detail is publicly recorded and verifiable on the Kaspa EVM layer.",
    },
    {
      icon: <Handshake className="h-8 w-8 text-accent" />,
      title: "Trustless Operations",
      description:
        "No intermediaries. Funds are secured in smart contracts and disbursed automatically upon meeting predefined conditions.",
    },
    {
      icon: <Share2 className="h-8 w-8 text-accent" />,
      title: "Immutable Accountability",
      description:
        "Each work week and dispute resolution is permanently recorded, building robust and reliable reputation scores for all parties.",
    },
  ]

  const stakeholders = [
    {
      icon: <Users className="h-10 w-10 text-accent" />,
      title: "Employers",
      description: "Efficiently hire and manage talent with guaranteed payment structures.",
      points: [
        "Post project or weekly jobs with clear terms.",
        "Lock KAS funds upfront, ensuring worker payment.",
        "Build an on-chain reputation for timely payments.",
      ],
      cta: "Post a Job",
      href: "/post-job",
    },
    {
      icon: <Briefcase className="h-10 w-10 text-accent" />,
      title: "Workers",
      description: "Access global opportunities and get paid fairly and transparently.",
      points: [
        "Browse listings and apply for on-chain jobs.",
        "Earn KAS payouts automatically, no manual invoicing.",
        "Accumulate a portable, verifiable reputation score.",
        "Optionally mint privacy-preserving ZK-Resume NFTs.",
      ],
      cta: "Find Work",
      href: "/jobs",
    },
    {
      icon: <Users2 className="h-10 w-10 text-accent" />,
      title: "Jurors & DAO Members",
      description: "Contribute to platform integrity and governance.",
      points: [
        "Serve on dispute panels for conflict resolution.",
        "Vote on outcomes to maintain fairness and deter bad actors.",
        "Participate in protocol upgrades and rule-setting.",
      ],
      cta: "Learn About Governance",
      href: "/dao",
    },
  ]

  const smartContractFeatures = [
    {
      icon: <LinkIcon className="h-6 w-6 text-accent/80" />,
      name: "Kasplex & Igra Labs Compatible",
      description: "Seamlessly integrated with leading Kaspa Layer 2's.",
    },
    {
      icon: <Cpu className="h-6 w-6 text-accent/80" />,
      name: "EVM Compatible",
      description:
        "Use your favorite EVM wallets like MetaMask, Phantom, Trust Wallet, Rainbow, and Coinbase Wallet to interact with the platform.",
    },
    {
      icon: <FileText className="h-6 w-6 text-accent/80" />,
      name: "Job Contracts",
      description: "Individual smart contracts hold locked funds, schedule payouts, and enforce job rules.",
    },
    {
      icon: <Landmark className="h-6 w-6 text-accent/80" />,
      name: "Reputation Ledger",
      description: "A shared, immutable on-chain registry of scores for both employers and workers.",
    },
    {
      icon: <Scale className="h-6 w-6 text-accent/80" />,
      name: "Dispute DAO",
      description: "A decentralized, lightweight vote-and-finalize system to handle conflicts fairly.",
    },
    {
      icon: <Shield className="h-6 w-6 text-accent/80" />,
      name: "ZK-Resume Module",
      description: "Lets workers prove work history privately using zero-knowledge proofs.",
    },
  ]

  const securityPoints = [
    {
      lead: "Immutable Funds Lock:",
      text: "Employers can't pull out funds mid-contract.",
      icon: <Lock className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />,
    },
    {
      lead: "Reentrancy & Access Controls:",
      text: "Standard smart-contract safeguards.",
      icon: <Shield className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />,
    },
    {
      lead: "No Oracles Required:",
      text: "All logic uses on-chain time and direct fund transfers.",
      icon: <Zap className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />,
    },
    {
      lead: "Decentralized Arbitration:",
      text: "Disputes handled by a staked juror group.",
      icon: <Scale className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />,
    },
  ]

  const headingLetterVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <motion.section
        className="w-full min-h-[calc(85vh-5rem)] flex flex-col justify-center items-center text-center relative overflow-hidden py-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1, 0.1)}
      >
        <div className="container px-4 md:px-6 relative z-10">
          <motion.h1
            className="font-poppins text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl !leading-tight text-accent mb-8 md:mb-10"
            initial="hidden"
            animate="visible"
            aria-label="Proof Of Works"
          >
            {"Proof Of Works".split("").map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                custom={index}
                variants={headingLetterVariants}
                style={{ display: "inline-block", whiteSpace: "pre" }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div
            variants={fadeIn(0.8 + "Proof Of Works".length * 0.05)}
            className="mt-6 max-w-xl lg:max-w-2xl mx-auto text-muted-foreground md:text-lg lg:text-xl"
          >
            <Balancer>
              The fully on-chain hiring, payroll, and reputation platform built on Kaspa's EVM layer. Experience
              unparalleled transparency, trustlessness, and accountability in the world of work.
            </Balancer>
          </motion.div>

          <motion.div
            variants={fadeIn(1.2 + "Proof Of Works".length * 0.05)}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <ConnectButton />
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent-hover text-accent-foreground shadow-lg hover:shadow-accent/40 transition-all duration-300 transform hover:scale-105 group"
            >
              <Link href="/jobs">
                Explore Opportunities
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="shadow-lg hover:shadow-md transition-all duration-300 transform hover:scale-105 group border-accent/50 hover:bg-accent/10 hover:text-accent"
            >
              <Link href="/post-job">
                Hire Talent
                <Users className="ml-2 h-5 w-5 group-hover:text-accent transition-colors" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Rest of your sections remain unchanged */}
      <SectionWrapper id="core-values" className="bg-background/50 dark:bg-black/5">
        <div className="container px-4 md:px-6 relative z-10">
          <h2 className="text-4xl font-bold mb-8 text-center">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="stakeholders" className="bg-background/50 dark:bg-black/5">
        <div className="container px-4 md:px-6 relative z-10">
          <h2 className="text-4xl font-bold mb-8 text-center">Stakeholders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stakeholders.map((stakeholder, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {stakeholder.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-2">{stakeholder.title}</h3>
                <p className="text-muted-foreground">{stakeholder.description}</p>
                <ul className="list-disc list-inside mt-2">
                  {stakeholder.points.map((point, pointIndex) => (
                    <li key={pointIndex}>{point}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="shadow-lg hover:shadow-md transition-all duration-300 transform hover:scale-105 group border-accent/50 hover:bg-accent/10 hover:text-accent"
                  >
                    <Link href={stakeholder.href}>
                      {stakeholder.cta}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="smart-contract-features" className="bg-background/50 dark:bg-black/5">
        <div className="container px-4 md:px-6 relative z-10">
          <h2 className="text-4xl font-bold mb-8 text-center">Smart Contract Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {smartContractFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-2">{feature.name}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="security-points" className="bg-background/50 dark:bg-black/5">
        <div className="container px-4 md:px-6 relative z-10">
          <h2 className="text-4xl font-bold mb-8 text-center">Security Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {securityPoints.map((point, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {point.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-2">{point.lead}</h3>
                <p className="text-muted-foreground">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </div>
  )
}

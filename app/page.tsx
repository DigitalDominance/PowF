"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

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
  UsersRound,
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

export default function LandingPage() {
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
      icon: <UsersRound className="h-10 w-10 text-accent" />,
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
      text: "Employers can’t pull out funds mid-contract.",
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
            // Apply new font "Poppins" and existing reduced size.
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
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
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

      <SectionWrapper id="difference" padding="pt-4 md:pt-8 lg:pt-12 pb-16 md:pb-20 lg:pb-24">
        <motion.div variants={fadeIn()} className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
            The <span className="text-accent">Proof Of Works</span> Difference
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
            <Balancer>Building a fair and efficient future for decentralized work.</Balancer>
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coreValues.map((value, index) => (
            <motion.div variants={fadeIn(index * 0.15)} key={value.title}>
              <InteractiveCard className="h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    <Balancer>{value.description}</Balancer>
                  </p>
                </div>
              </InteractiveCard>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ... rest of the page content remains the same ... */}
      <SectionWrapper id="stakeholders">
        <motion.div variants={fadeIn()} className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
            Empowering <span className="text-accent">All Participants</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
            <Balancer>
              Proof Of Works is designed for seamless interaction between employers, workers, and the governing DAO.
            </Balancer>
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stakeholders.map((stakeholder, index) => (
            <motion.div variants={fadeIn(index * 0.2)} key={stakeholder.title}>
              <InteractiveCard className="h-full flex flex-col" as="a" href={stakeholder.href}>
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-accent/10 mr-4">{stakeholder.icon}</div>
                  <h3 className="text-2xl font-semibold text-foreground">{stakeholder.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  <Balancer>{stakeholder.description}</Balancer>
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-grow">
                  {stakeholder.points.map((point) => (
                    <li key={point} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-accent mr-2 mt-0.5 shrink-0" />
                      <span>
                        <Balancer>{point}</Balancer>
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full mt-auto border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-colors group"
                >
                  {stakeholder.cta}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </InteractiveCard>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper id="smart-contracts">
        <motion.div variants={fadeIn()} className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
            Powered By <span className="text-accent">Smart Contracts</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
            <Balancer>
              Our platform leverages secure smart contracts and on-chain logic for trustless automation.
            </Balancer>
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {smartContractFeatures.map((component, index) => (
            <motion.div variants={fadeIn(index * 0.1)} key={component.name}>
              <InteractiveCard className="h-full">
                <div className="flex items-center gap-3 mb-3">
                  {component.icon}
                  <h4 className="font-semibold text-foreground">{component.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  <Balancer>{component.description}</Balancer>
                </p>
              </InteractiveCard>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeIn(0.5)} className="text-center mt-16 md:mt-20">
          <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
            Security & Fairness <span className="text-accent">Guaranteed</span>
          </h3>
          <InteractiveCard className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-base md:text-lg text-muted-foreground text-center md:text-left">
              {securityPoints.map((item) => (
                <div
                  key={item.text}
                  className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left"
                >
                  {item.icon}
                  <div className="sm:ml-3 mt-2 sm:mt-0">
                    <span className="font-bold text-foreground">{item.lead}</span> <Balancer>{item.text}</Balancer>
                  </div>
                </div>
              ))}
            </div>
          </InteractiveCard>
        </motion.div>
      </SectionWrapper>

      <SectionWrapper id="get-kas" padding="pt-8 md:pt-12 lg:pt-16 pb-16 md:pb-20 lg:pb-24">
        <motion.div variants={fadeIn()} className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
            Swap Your Crypto for <span className="text-accent">KAS</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
            <Balancer>
              Easily swap your existing crypto for KAS to participate in the Proof Of Works ecosystem.
            </Balancer>
          </p>
        </motion.div>
        <div className="max-w-md mx-auto">
          <ChangeNowWidget />
        </div>
      </SectionWrapper>

      <SectionWrapper id="why-it-matters">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground mb-10 md:mb-12">
            Why <span className="text-accent">Proof Of Works</span> Matters
          </h2>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8 text-left mb-10">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center">
                <Users className="h-6 w-6 text-accent mr-2" />
                For Employers:
              </h3>
              <p className="text-muted-foreground">
                <Balancer>
                  Lowers friction—no escrow panels or legal paperwork, yet payments are guaranteed. Attract top talent
                  with transparent and secure processes.
                </Balancer>
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center">
                <Briefcase className="h-6 w-6 text-accent mr-2" />
                For Workers:
              </h3>
              <p className="text-muted-foreground">
                <Balancer>
                  Instant, trustless pay and a portable reputation that grows with you. Access a global job market with
                  confidence.
                </Balancer>
              </p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-accent mr-2" />
              For the Kaspa Ecosystem:
            </h3>
            <p className="text-muted-foreground">
              <Balancer>
                Demonstrates the power of a fully on-chain, EVM-compatible Kaspa identity and payments layer—paving the
                way for richer DeFi and DAO integrations down the road.
              </Balancer>
            </p>
          </div>

          <motion.div variants={fadeIn(0.5)} className="mt-12">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent-hover text-accent-foreground shadow-xl hover:shadow-accent/50 transition-all duration-300 transform hover:scale-105 group"
            >
              <Link href="/jobs">
                Join the Revolution
                <Zap className="ml-2 h-5 w-5 group-hover:rotate-[15deg] transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  )
}

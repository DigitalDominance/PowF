"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type React from "react"
import { useState } from "react"

import {
  BookOpen,
  Code,
  Zap,
  Users,
  Shield,
  DollarSign,
  Search,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  Settings,
  Globe,
  Wallet,
  MessageSquare,
  Scale,
  Lock,
  Eye,
  ChevronRight,
  Play,
  Download,
  Github,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { InteractiveCard } from "@/components/custom/interactive-card"
import { Balancer } from "react-wrap-balancer"
import { toast } from "sonner"

// Animation variants
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

// Section wrapper component
const SectionWrapper = ({
  children,
  className,
  id,
  padding = "py-12 md:py-16",
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

const CodeBlock = ({
  title,
  code,
  language = "javascript",
}: {
  title: string
  code: string
  language?: string
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-muted/50 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <span className="text-sm font-medium text-foreground font-varien">{title}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 w-8 p-0">
          {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-foreground font-varela">{code}</code>
      </pre>
    </div>
  )
}

export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const quickStartSteps = [
    {
      icon: <Wallet className="h-6 w-6 text-accent" />,
      title: "Connect Wallet",
      description: "Connect your MetaMask or compatible EVM wallet to the Kaspa network.",
    },
    {
      icon: <DollarSign className="h-6 w-6 text-accent" />,
      title: "Get KAS Tokens",
      description: "Acquire KAS tokens through our integrated swap widget or supported exchanges.",
    },
    {
      icon: <Users className="h-6 w-6 text-accent" />,
      title: "Choose Your Role",
      description: "Register as an employer to post jobs or as a worker to find opportunities.",
    },
    {
      icon: <Zap className="h-6 w-6 text-accent" />,
      title: "Start Working",
      description: "Post jobs, apply for work, and let smart contracts handle the rest!",
    },
  ]

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/jobs",
      description: "Retrieve all active job listings",
      params: "?page=1&limit=10&category=development",
    },
    {
      method: "POST",
      endpoint: "/api/jobs",
      description: "Create a new job listing",
      params: "{ title, description, payAmount, payType }",
    },
    {
      method: "GET",
      endpoint: "/api/jobs/:id/applicants",
      description: "Get applicants for a specific job",
      params: "Authorization: Bearer <token>",
    },
    {
      method: "POST",
      endpoint: "/api/disputes",
      description: "Create a new dispute",
      params: "{ jobId, reason, evidence }",
    },
  ]

  const smartContracts = [
    {
      name: "JobFactory",
      address: "0x1234...5678",
      description: "Creates and manages job contracts",
      functions: ["createJob", "getJobsByEmployer", "getAllJobs"],
    },
    {
      name: "ProofOfWorkJob",
      address: "0xabcd...efgh",
      description: "Individual job contract with payment logic",
      functions: ["submitApplication", "acceptApplication", "makePayment"],
    },
    {
      name: "DisputeDAO",
      address: "0x9876...5432",
      description: "Handles dispute resolution and voting",
      functions: ["createDispute", "vote", "resolveDispute"],
    },
  ]

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <motion.section
        className="w-full min-h-[50vh] flex flex-col justify-center items-center text-center relative overflow-hidden py-16"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1, 0.1)}
      >
        <div className="container px-4 md:px-6 relative z-10">
          <motion.h1
            variants={fadeIn(0.1)}
            className="font-varien text-4xl font-normal tracking-wider-xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground mb-6"
          >
            <span className="text-accent">Documentation</span>
          </motion.h1>
          <motion.p
            variants={fadeIn(0.2)}
            className="mt-6 max-w-3xl mx-auto text-muted-foreground md:text-lg lg:text-xl font-varela"
          >
            <Balancer>
              Complete guides, API references, and smart contract documentation for building on the Proof Of Works
              platform.
            </Balancer>
          </motion.p>

          {/* Search Bar */}
          <motion.div variants={fadeIn(0.3)} className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-10 border-accent/30 focus:border-accent font-varela"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Start */}
      <SectionWrapper id="quick-start" padding="py-8 md:py-12">
        <motion.div variants={fadeIn()} className="text-center mb-12">
          <h2 className="font-varien text-3xl font-normal tracking-wider-xl sm:text-4xl text-foreground mb-6">
            Quick <span className="text-accent">Start Guide</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground font-varela">
            <Balancer>Get up and running with POW in just a few simple steps.</Balancer>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStartSteps.map((step, index) => (
            <motion.div variants={fadeIn(index * 0.1)} key={step.title}>
              <InteractiveCard className="h-full text-center">
                <div className="flex flex-col items-center p-6">
                  <div className="p-4 rounded-full bg-accent/10 mb-4">{step.icon}</div>
                  <h3 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-varela">
                    <Balancer>{step.description}</Balancer>
                  </p>
                </div>
              </InteractiveCard>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeIn(0.4)} className="text-center">
          <Button
            asChild
            size="lg"
            className="font-varien bg-accent hover:bg-accent-hover text-accent-foreground shadow-lg hover:shadow-accent/40 transition-all duration-300 transform hover:scale-105 group tracking-wider"
          >
            <Link href="/jobs">
              Start Building
              <Play className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </SectionWrapper>

      {/* Documentation Tabs */}
      <SectionWrapper id="docs-content" padding="py-8 md:py-12">
        <Tabs defaultValue="user-guide" className="w-full">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-8 font-varien">
            <TabsTrigger value="user-guide" className="text-sm">
              <BookOpen className="mr-2 h-4 w-4" />
              User Guide
            </TabsTrigger>
            <TabsTrigger value="api" className="text-sm">
              <Code className="mr-2 h-4 w-4" />
              API Reference
            </TabsTrigger>
            <TabsTrigger value="smart-contracts" className="text-sm">
              <Shield className="mr-2 h-4 w-4" />
              Smart Contracts
            </TabsTrigger>
            <TabsTrigger value="examples" className="text-sm">
              <Lightbulb className="mr-2 h-4 w-4" />
              Examples
            </TabsTrigger>
          </TabsList>

          {/* User Guide Tab */}
          <TabsContent value="user-guide" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* For Employers */}
              <InteractiveCard>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-accent/10">
                      <Users className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-varien text-xl font-normal tracking-wider text-foreground">For Employers</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-varien text-base font-normal tracking-wider text-foreground mb-2">
                        Creating Your First Job
                      </h4>
                      <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground font-varela">
                        <li>Connect your wallet and ensure you have sufficient KAS</li>
                        <li>Navigate to "Post a Job" and fill out the job details</li>
                        <li>Choose between weekly or one-time payment structure</li>
                        <li>Lock funds in the smart contract (includes 0.75% platform fee)</li>
                        <li>Your job goes live immediately for applications</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-varien text-base font-normal tracking-wider text-foreground mb-2">
                        Managing Applications
                      </h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground font-varela">
                        <li>Review applicant profiles and on-chain reputation</li>
                        <li>Accept or decline applications with feedback</li>
                        <li>Communicate directly with potential hires</li>
                        <li>Track active jobs and payment schedules</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-varien text-base font-normal tracking-wider text-foreground mb-2">
                        Payment & Disputes
                      </h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground font-varela">
                        <li>Payments are automatic based on contract terms</li>
                        <li>Open disputes if work quality issues arise</li>
                        <li>Participate in dispute resolution process</li>
                        <li>Build your employer reputation score</li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full mt-6 bg-accent hover:bg-accent-hover text-accent-foreground font-varien"
                  >
                    <Link href="/post-job">
                      Post Your First Job
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </InteractiveCard>

              {/* For Workers */}
              <InteractiveCard>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-accent/10">
                      <Zap className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-varien text-xl font-normal tracking-wider text-foreground">For Workers</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-varien text-base font-normal tracking-wider text-foreground mb-2">
                        Finding Work
                      </h4>
                      <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground font-varela">
                        <li>Browse available jobs by category, pay rate, or employer rating</li>
                        <li>Use filters to find opportunities matching your skills</li>
                        <li>Review job requirements and payment terms carefully</li>
                        <li>Submit compelling applications with relevant experience</li>
                        <li>Track application status and employer responses</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-varien text-base font-normal tracking-wider text-foreground mb-2">
                        Working & Getting Paid
                      </h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground font-varela">
                        <li>Communicate with employers through secure messaging</li>
                        <li>Complete work according to agreed specifications</li>
                        <li>Receive automatic payments per contract schedule</li>
                        <li>Build your on-chain reputation with each job</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-varien text-base font-normal tracking-wider text-foreground mb-2">
                        Dispute Resolution
                      </h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground font-varela">
                        <li>Open disputes for payment or scope issues</li>
                        <li>Provide evidence and communicate with jurors</li>
                        <li>Participate in fair, decentralized resolution</li>
                        <li>Maintain professional conduct throughout</li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full mt-6 bg-accent hover:bg-accent-hover text-accent-foreground font-varien"
                  >
                    <Link href="/jobs">
                      Find Work Opportunities
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </InteractiveCard>
            </div>

            {/* Platform Features */}
            <div className="space-y-6">
              <h3 className="font-varien text-2xl font-normal tracking-wider text-foreground text-center">
                Platform <span className="text-accent">Features</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InteractiveCard>
                  <div className="p-6 text-center">
                    <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                      <Lock className="h-6 w-6 text-accent" />
                    </div>
                    <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">
                      Smart Contract Security
                    </h4>
                    <p className="text-sm text-muted-foreground font-varela">
                      All funds are secured in audited smart contracts with automatic execution and dispute protection.
                    </p>
                  </div>
                </InteractiveCard>

                <InteractiveCard>
                  <div className="p-6 text-center">
                    <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                      <Scale className="h-6 w-6 text-accent" />
                    </div>
                    <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">
                      Fair Dispute System
                    </h4>
                    <p className="text-sm text-muted-foreground font-varela">
                      Decentralized arbitration through qualified jurors ensures fair outcomes for all parties.
                    </p>
                  </div>
                </InteractiveCard>

                <InteractiveCard>
                  <div className="p-6 text-center">
                    <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                      <Eye className="h-6 w-6 text-accent" />
                    </div>
                    <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">
                      Transparent Reputation
                    </h4>
                    <p className="text-sm text-muted-foreground font-varela">
                      Build verifiable, portable reputation scores that follow you across the decentralized web.
                    </p>
                  </div>
                </InteractiveCard>
              </div>
            </div>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="font-varien text-2xl font-normal tracking-wider text-foreground mb-4">
                API <span className="text-accent">Reference</span>
              </h3>
              <p className="text-muted-foreground font-varela max-w-2xl mx-auto">
                <Balancer>
                  RESTful API endpoints for integrating with the POW platform. All endpoints require authentication.
                </Balancer>
              </p>
            </div>

            {/* Base URL */}
            <InteractiveCard>
              <div className="p-6">
                <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-4">Base URL</h4>
                <CodeBlock title="Production Endpoint" code="https://api.proofofworks.io/v1" />
                <div className="mt-4 p-4 bg-accent/10 rounded border border-accent/20">
                  <p className="text-sm text-muted-foreground font-varela">
                    <strong>Authentication:</strong> Include your API key in the Authorization header:
                    <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">Bearer YOUR_API_KEY</code>
                  </p>
                </div>
              </div>
            </InteractiveCard>

            {/* API Endpoints */}
            <div className="space-y-6">
              {apiEndpoints.map((endpoint, index) => (
                <InteractiveCard key={index}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge
                        variant={endpoint.method === "GET" ? "secondary" : "default"}
                        className={`font-mono ${
                          endpoint.method === "GET"
                            ? "bg-green-500/20 text-green-600 border-green-500/30"
                            : "bg-blue-500/20 text-blue-600 border-blue-500/30"
                        }`}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="font-mono text-sm text-foreground font-varela">{endpoint.endpoint}</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 font-varela">{endpoint.description}</p>
                    <CodeBlock
                      title="Example Request"
                      code={`curl -X ${endpoint.method} "https://api.proofofworks.io/v1${endpoint.endpoint}${endpoint.params.startsWith("{") ? "" : endpoint.params}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${
    endpoint.params.startsWith("{")
      ? ` \\
  -d '${endpoint.params}'`
      : ""
  }`}
                    />
                  </div>
                </InteractiveCard>
              ))}
            </div>

            {/* Rate Limits */}
            <InteractiveCard>
              <div className="p-6">
                <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-4">Rate Limits</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-muted/50 rounded">
                    <div className="text-2xl font-bold text-accent font-varien">1000</div>
                    <div className="text-sm text-muted-foreground font-varela">Requests per hour</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded">
                    <div className="text-2xl font-bold text-accent font-varien">100</div>
                    <div className="text-sm text-muted-foreground font-varela">Requests per minute</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded">
                    <div className="text-2xl font-bold text-accent font-varien">10</div>
                    <div className="text-sm text-muted-foreground font-varela">Concurrent requests</div>
                  </div>
                </div>
              </div>
            </InteractiveCard>
          </TabsContent>

          {/* Smart Contracts Tab */}
          <TabsContent value="smart-contracts" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="font-varien text-2xl font-normal tracking-wider text-foreground mb-4">
                Smart <span className="text-accent">Contracts</span>
              </h3>
              <p className="text-muted-foreground font-varela max-w-2xl mx-auto">
                <Balancer>Deployed smart contracts on Kaspa EVM. All contracts are verified and open source.</Balancer>
              </p>
            </div>

            {/* Contract Addresses */}
            <div className="space-y-6">
              {smartContracts.map((contract, index) => (
                <InteractiveCard key={index}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-varien text-lg font-normal tracking-wider text-foreground">
                        {contract.name}
                      </h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="font-varien bg-transparent">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on Explorer
                        </Button>
                        <Button variant="outline" size="sm" className="font-varien bg-transparent">
                          <Github className="mr-2 h-4 w-4" />
                          Source Code
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 font-varela">{contract.description}</p>

                    <div className="mb-4">
                      <label className="text-sm font-medium text-foreground font-varien">Contract Address:</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-2 bg-muted rounded text-sm font-mono font-varela">
                          {contract.address}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(contract.address)
                            toast.success("Address copied!")
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground font-varien">Key Functions:</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {contract.functions.map((func) => (
                          <Badge key={func} variant="secondary" className="font-mono text-xs font-varela">
                            {func}()
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </div>

            {/* Integration Example */}
            <InteractiveCard>
              <div className="p-6">
                <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-4">
                  Integration Example
                </h4>
                <CodeBlock
                  title="Connecting to JobFactory Contract"
                  code={`import { ethers } from 'ethers';
import JobFactoryABI from './JobFactory.json';

// Connect to Kaspa EVM
const provider = new ethers.JsonRpcProvider('https://rpc.kaspa-evm.io');
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Initialize contract
const jobFactory = new ethers.Contract(
  '0x1234...5678', // JobFactory address
  JobFactoryABI,
  signer
);

// Create a new job
const tx = await jobFactory.createJob(
  employerAddress,
  paymentType, // 0 = WEEKLY, 1 = ONE_OFF
  weeklyPayWei,
  durationWeeks,
  totalPayWei,
  jobTitle,
  description,
  positions,
  tags,
  { value: totalPayWei + platformFee }
);

await tx.wait();
console.log('Job created successfully!');`}
                />
              </div>
            </InteractiveCard>

            {/* ABI Downloads */}
            <InteractiveCard>
              <div className="p-6">
                <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-4">Contract ABIs</h4>
                <p className="text-sm text-muted-foreground mb-4 font-varela">
                  Download the Application Binary Interface (ABI) files for contract integration:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {smartContracts.map((contract) => (
                    <Button
                      key={contract.name}
                      variant="outline"
                      className="font-varien border-accent/50 hover:bg-accent/10 bg-transparent"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {contract.name}.json
                    </Button>
                  ))}
                </div>
              </div>
            </InteractiveCard>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="font-varien text-2xl font-normal tracking-wider text-foreground mb-4">
                Code <span className="text-accent">Examples</span>
              </h3>
              <p className="text-muted-foreground font-varela max-w-2xl mx-auto">
                <Balancer>Practical examples and code snippets to help you integrate with POW.</Balancer>
              </p>
            </div>

            {/* Frontend Integration */}
            <InteractiveCard>
              <div className="p-6">
                <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-4">
                  Frontend Integration
                </h4>
                <CodeBlock
                  title="React Component for Job Listing"
                  code={`import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('https://api.proofofworks.io/v1/jobs', {
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY'
        }
      });
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (jobId) => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Submit application logic here
      console.log('Applying to job:', jobId);
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  if (loading) return <div>Loading jobs...</div>;

  return (
    <div className="job-listings">
      {jobs.map(job => (
        <div key={job.id} className="job-card">
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <p>Pay: {job.payAmount} KAS</p>
          <button onClick={() => applyToJob(job.id)}>
            Apply Now
          </button>
        </div>
      ))}
    </div>
  );
};

export default JobListing;`}
                />
              </div>
            </InteractiveCard>

            {/* Backend Integration */}
            <InteractiveCard>
              <div className="p-6">
                <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-4">
                  Backend Integration
                </h4>
                <CodeBlock
                  title="Node.js API Integration"
                  code={`const express = require('express');
const { ethers } = require('ethers');
const JobFactoryABI = require('./contracts/JobFactory.json');

const app = express();
app.use(express.json());

// Initialize blockchain connection
const provider = new ethers.JsonRpcProvider('https://rpc.kaspa-evm.io');
const jobFactory = new ethers.Contract(
  process.env.JOB_FACTORY_ADDRESS,
  JobFactoryABI,
  provider
);

// Create job endpoint
app.post('/api/jobs', async (req, res) => {
  try {
    const { 
      employerAddress, 
      title, 
      description, 
      payAmount, 
      payType 
    } = req.body;

    // Validate input
    if (!employerAddress || !title || !payAmount) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Create job on blockchain
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const jobFactoryWithSigner = jobFactory.connect(signer);

    const tx = await jobFactoryWithSigner.createJob(
      employerAddress,
      payType === 'weekly' ? 0 : 1,
      ethers.parseEther(payAmount.toString()),
      // ... other parameters
    );

    const receipt = await tx.wait();
    
    res.json({
      success: true,
      jobAddress: receipt.logs[0].address,
      transactionHash: receipt.hash
    });

  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get jobs endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Fetch jobs from blockchain events
    const filter = jobFactory.filters.JobCreated();
    const events = await jobFactory.queryFilter(filter);
    
    const jobs = events.map(event => ({
      id: event.args.jobAddress,
      title: event.args.title,
      employer: event.args.employer,
      payAmount: ethers.formatEther(event.args.totalPay),
      createdAt: new Date(event.args.timestamp * 1000)
    }));

    // Implement pagination
    const startIndex = (page - 1) * limit;
    const paginatedJobs = jobs.slice(startIndex, startIndex + limit);

    res.json({
      jobs: paginatedJobs,
      total: jobs.length,
      page: parseInt(page),
      totalPages: Math.ceil(jobs.length / limit)
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.listen(3000, () => {
  console.log('POW API server running on port 3000');
});`}
                />
              </div>
            </InteractiveCard>

            {/* Webhook Integration */}
            <InteractiveCard>
              <div className="p-6">
                <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-4">
                  Webhook Integration
                </h4>
                <CodeBlock
                  title="Handling POW Webhooks"
                  code={`const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.raw({ type: 'application/json' }));

// Webhook endpoint
app.post('/webhooks/pow', (req, res) => {
  const signature = req.headers['x-pow-signature'];
  const payload = req.body;

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== \`sha256=\${expectedSignature}\`) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(payload);

  // Handle different event types
  switch (event.type) {
    case 'job.created':
      handleJobCreated(event.data);
      break;
    
    case 'application.submitted':
      handleApplicationSubmitted(event.data);
      break;
    
    case 'payment.completed':
      handlePaymentCompleted(event.data);
      break;
    
    case 'dispute.opened':
      handleDisputeOpened(event.data);
      break;
    
    default:
      console.log('Unknown event type:', event.type);
  }

  res.status(200).send('OK');
});

const handleJobCreated = (data) => {
  console.log('New job created:', data.jobId);
  // Send notification to relevant users
  // Update your database
  // Trigger other business logic
};

const handleApplicationSubmitted = (data) => {
  console.log('New application:', data.applicationId);
  // Notify employer
  // Update application status
};

const handlePaymentCompleted = (data) => {
  console.log('Payment completed:', data.paymentId);
  // Update payment records
  // Send confirmation to worker
};

const handleDisputeOpened = (data) => {
  console.log('Dispute opened:', data.disputeId);
  // Notify relevant parties
  // Alert dispute resolution team
};

app.listen(3001, () => {
  console.log('Webhook server running on port 3001');
});`}
                />
              </div>
            </InteractiveCard>

            {/* Mobile SDK */}
            <InteractiveCard>
              <div className="p-6">
                <h4 className="font-varien text-lg font-normal tracking-wider text-foreground mb-4">
                  Mobile SDK (React Native)
                </h4>
                <CodeBlock
                  title="React Native Integration"
                  code={`import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { WalletConnect } from '@walletconnect/react-native';

const POWMobileApp = () => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    try {
      // Initialize WalletConnect
      const connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
        qrcodeModal: QRCodeModal,
      });

      if (!connector.connected) {
        await connector.createSession();
      }

      connector.on('connect', (error, payload) => {
        if (error) {
          throw error;
        }

        const { accounts } = payload.params[0];
        setAccount(accounts[0]);
        setConnected(true);
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet');
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('https://api.proofofworks.io/v1/jobs');
      const data = await response.json();
      return data.jobs;
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch jobs');
    }
  };

  const applyToJob = async (jobId) => {
    if (!connected) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    try {
      // Submit application via API
      const response = await fetch(\`https://api.proofofworks.io/v1/jobs/\${jobId}/apply\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${API_KEY}\`
        },
        body: JSON.stringify({
          applicantAddress: account,
          coverLetter: 'Your application text here'
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Application submitted successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        POW Mobile
      </Text>
      
      {!connected ? (
        <Button title="Connect Wallet" onPress={connectWallet} />
      ) : (
        <View>
          <Text>Connected: {account.substring(0, 6)}...{account.substring(38)}</Text>
          <Button title="Browse Jobs" onPress={fetchJobs} />
        </View>
      )}
    </View>
  );
};

export default POWMobileApp;`}
                />
              </div>
            </InteractiveCard>
          </TabsContent>
        </Tabs>
      </SectionWrapper>

      {/* Resources */}
      <SectionWrapper id="resources" padding="py-12 md:py-16">
        <motion.div variants={fadeIn()} className="text-center mb-12">
          <h2 className="font-varien text-3xl font-normal tracking-wider-xl sm:text-4xl text-foreground mb-6">
            Additional <span className="text-accent">Resources</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground font-varela">
            <Balancer>Helpful links, tools, and community resources for POW developers and users.</Balancer>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InteractiveCard>
            <div className="p-6 text-center">
              <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                <Github className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">GitHub Repository</h3>
              <p className="text-sm text-muted-foreground mb-4 font-varela">
                Access our open-source code, contribute to development, and report issues.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 font-varien bg-transparent"
              >
                <Link href="https://github.com/proofofworks" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="p-6 text-center">
              <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">Discord Community</h3>
              <p className="text-sm text-muted-foreground mb-4 font-varela">
                Join our community for support, discussions, and development updates.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 font-varien bg-transparent"
              >
                <Link href="https://discord.gg/proofofworks" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Join Discord
                </Link>
              </Button>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="p-6 text-center">
              <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">Whitepaper</h3>
              <p className="text-sm text-muted-foreground mb-4 font-varela">
                Read our technical whitepaper for in-depth platform architecture details.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 font-varien bg-transparent"
              >
                <Link href="/whitepaper.pdf" target="_blank">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Link>
              </Button>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="p-6 text-center">
              <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                <Globe className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">Kaspa Network</h3>
              <p className="text-sm text-muted-foreground mb-4 font-varela">
                Learn more about the Kaspa blockchain that powers our platform.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 font-varien bg-transparent"
              >
                <Link href="https://kaspa.org" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Kaspa.org
                </Link>
              </Button>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="p-6 text-center">
              <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                <Settings className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">Developer Tools</h3>
              <p className="text-sm text-muted-foreground mb-4 font-varela">
                SDKs, testing tools, and development utilities for building on POW.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 font-varien bg-transparent"
              >
                <Link href="/tools">
                  <Settings className="mr-2 h-4 w-4" />
                  View Tools
                </Link>
              </Button>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="p-6 text-center">
              <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                <AlertTriangle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-varien text-lg font-normal tracking-wider text-foreground mb-2">Bug Bounty</h3>
              <p className="text-sm text-muted-foreground mb-4 font-varela">
                Help secure our platform and earn rewards for finding vulnerabilities.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 font-varien bg-transparent"
              >
                <Link href="/bug-bounty">
                  <Shield className="mr-2 h-4 w-4" />
                  Learn More
                </Link>
              </Button>
            </div>
          </InteractiveCard>
        </div>
      </SectionWrapper>

      {/* Call to Action */}
      <SectionWrapper id="cta" padding="py-12 md:py-16">
        <motion.div variants={fadeIn()} className="text-center">
          <InteractiveCard className="max-w-2xl mx-auto p-8">
            <h2 className="font-varien text-2xl font-normal tracking-wider text-foreground mb-4">
              Ready to <span className="text-accent">Build</span>?
            </h2>
            <p className="text-muted-foreground mb-6 font-varela">
              <Balancer>Start integrating with POW today and join the future of decentralized work.</Balancer>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="font-varien bg-accent hover:bg-accent-hover text-accent-foreground shadow-lg hover:shadow-accent/40 transition-all duration-300 transform hover:scale-105 group tracking-wider"
              >
                <Link href="/jobs">
                  Start Building
                  <Code className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="font-varien shadow-lg hover:shadow-md transition-all duration-300 transform hover:scale-105 group border-accent/50 hover:bg-accent/10 hover:text-accent tracking-wider bg-transparent"
              >
                <Link href="mailto:developers@proofofworks.io">
                  Get Support
                  <MessageSquare className="ml-2 h-5 w-5 group-hover:text-accent transition-colors" />
                </Link>
              </Button>
            </div>
          </InteractiveCard>
        </motion.div>
      </SectionWrapper>
    </div>
  )
}

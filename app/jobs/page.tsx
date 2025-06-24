"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type React from "react"
import { useEffect, useState } from "react"

import {
  ArrowRight,
  Search,
  Briefcase,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Star,
  Filter,
  CheckCircle,
  XCircle,
  Clock3,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { InteractiveCard } from "@/components/custom/interactive-card"
import { Balancer } from "react-wrap-balancer"
import { ethers } from "ethers"
import PROOF_OF_WORK_JOB_ABI from '@/lib/contracts/ProofOfWorkJob.json';
import REPUTATION_SYSTEM_ABI from '@/lib/contracts/ReputationSystem.json';
import DISPUTE_DAO_ABI from '@/lib/contracts/DisputeDAO.json';
import axios from "axios"
import { toast } from "sonner"
import { fetchEmployerDisplayName, useUserContext } from "@/context/UserContext"

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

export default function JobsPage() {
  const { contracts, provider, role, address, allJobs, jobAddresses, myJobs } = useUserContext();
  
  // State for job filters
  const [searchTerm, setSearchTerm] = useState("")
  const [payTypeFilter, setPayTypeFilter] = useState<string>("all")
  const [minPayFilter, setMinPayFilter] = useState<number[]>([0])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [applicationText, setApplicationText] = useState("")
  const [disputeReason, setDisputeReason] = useState("")
  const [selectedJobForDispute, setSelectedJobForDispute] = useState<(typeof myJobs)[0] | null>(null)
  const [myApplications, setMyApplications] = useState<any[]>([]);

  // Filter jobs based on search and filters
  const filteredJobs = allJobs?.filter((job) => {
    // Search term filter
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some((tag: any) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    // Payment type filter
    const matchesPayType = payTypeFilter === "all" || job.payType === payTypeFilter

    // Minimum pay filter
    const payAmount = job.payType === "WEEKLY" ? Number.parseFloat(job.weeklyPay) : Number.parseFloat(job.totalPay)
    const matchesMinPay = payAmount >= minPayFilter[0]

    console.log('matchesSearch', matchesSearch, matchesPayType, matchesMinPay)

    return matchesSearch && matchesPayType && matchesMinPay
  }) || [];

  console.log('filteredJobs', filteredJobs);

  const handleSubmitApplication = async (jobAddress: string, applicationText: string) => {
    if (!provider || !contracts) {
      toast.error("Please connect your wallet first.");
      return;
    }
  
    try {
      const signer = await provider.getSigner();
      const jobContract = new ethers.Contract(jobAddress, PROOF_OF_WORK_JOB_ABI, signer);
  
      // Call the submitApplication function
      const txPromise = jobContract.submitApplication(applicationText);
  
      toast.promise(
        txPromise,
        {
          loading: "Please wait for confirmation...",
          success: "Submitting Application...",
          error: "Failed to submit application.",
        }
      );
  
      // Wait for the transaction to be mined
      const tx = await txPromise;
      await tx.wait();

      toast.success(
          "Application submitted successfully!"
      )
  
      console.log("Application submitted:", tx);

      setApplicationText("")
      setSelectedJob(null)

      // Fetch the updated application details
      const [applicantAddress, application, appliedAt, isActive, status, reviewedAt, wasAccepted] = await jobContract.getApplicant(address);

      const isWorker = await jobContract.isWorker(address);

      // Determine the application status
      let applicationStatus = "pending";
      if (isWorker) {
        applicationStatus = "hired"; // The applicant is already working
      } else if (status === 1) { // REVIEWED
        applicationStatus = wasAccepted ? "hired" : "rejected";
      }

      // Fetch job title and employer for display
      const [jobTitle, employer] = await Promise.all([
        jobContract.title(),
        jobContract.employer(),
      ]);

      const employerName = await fetchEmployerDisplayName(employer);

      const newApplication = {
        jobAddress,
        jobTitle,
        employer: employerName,
        application,
        appliedAt: new Date(Number(appliedAt) * 1000).toLocaleDateString(),
        status: applicationStatus,
      };      
      setMyApplications((prev) => [...prev, newApplication]);
    } catch (error) {
      console.error("Error submitting application:", error);
      // const errorMessage = error instanceof Error ? error.message : "Failed to submit application.";
      // toast.error(errorMessage);
    }
  };  

  // Handle job application
  const handleApply = async () => {
    if (role !== "worker") {
      toast.error("Only workers can apply for jobs.", { duration: 3000 });
      return;
    }

    console.log("Applied to job:", selectedJob?.address, "with text:", applicationText)

    if (!selectedJob) {
      toast.error("Please select a job to apply for.");
      return;
    }
  
    if (!applicationText.trim()) {
      toast.error("Application text cannot be empty.");
      return;
    }    

    try {
      // Check if the user has already applied for the job
      const jobContract = new ethers.Contract(selectedJob.address, PROOF_OF_WORK_JOB_ABI, provider);
      const hasApplied = await jobContract.hasApplied(address);
  
      if (hasApplied) {
        toast.info("You have already applied for this job.");
        return;
      }
  
      console.log("Applying to job:", selectedJob.address, "with text:", applicationText);
  
      // Submit the application
      handleSubmitApplication(selectedJob.address, applicationText);
    } catch (error) {
      console.error("Error checking application status:", error);
      toast.error("Failed to check application status.");
    }
  }

  // Handle dispute submission
  const handleDisputeSubmit = async () => {
    if (!provider || !contracts || !selectedJobForDispute) {
      toast.error("Please connect your wallet and select a job to open a dispute.");
      return;
    }
  
    if (!disputeReason.trim()) {
      toast.error("Dispute reason cannot be empty.");
      return;
    }
  
    try {
      const signer = await provider.getSigner();
      const disputeDAOContract = new ethers.Contract(
        selectedJobForDispute.disputeDAOAddress, // Address of the DisputeDAO contract
        DISPUTE_DAO_ABI, // ABI of the DisputeDAO contract
        signer
      );
  
      // Call the createDispute function
      const txPromise = disputeDAOContract.createDispute(
        selectedJobForDispute.id, // Job address
        disputeReason // Reason for the dispute
      );
  
      // Use toast.promise to handle the transaction
      toast.promise(
        txPromise,
        {
          loading: "Submitting dispute...",
          success: "Dispute submitted successfully!",
          error: "Failed to submit dispute.",
        }
      );
  
      // Wait for the transaction to be mined
      const tx = await txPromise;
      await tx.wait();

      // Show a success toast message after the transaction is confirmed
      toast.success("Dispute created successfully!");      
  
      console.log("Dispute created:", tx);
  
      // Reset the dispute form
      setDisputeReason("");
      setSelectedJobForDispute(null);
    } catch (error) {
      console.error("Error submitting dispute:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit dispute.";
      toast.error(errorMessage);
    }
    // In a real implementation, this would call a smart contract function
  }

  const fetchMyApplications = async (jobAddresses: string[], userAddress: string) => {
    try {
      const applications = [];
      for (const jobAddress of jobAddresses) {
        const jobContract = new ethers.Contract(jobAddress, PROOF_OF_WORK_JOB_ABI, provider);

        // Check if the user has applied to this job
        const hasApplied = await jobContract.hasApplied(userAddress);
        if (hasApplied) {
          // Fetch application details
          const [applicantAddress, application, appliedAt, isActive, status, reviewedAt, wasAccepted] = await jobContract.getApplicant(userAddress);

          // Check if the user is already a worker
          const isWorker = await jobContract.isWorker(userAddress);

          // Determine the application status
          let applicationStatus = "pending";
          if (isWorker) {
            applicationStatus = "hired"; // The applicant is already working
          } else if (status === 1) { // REVIEWED
            applicationStatus = wasAccepted ? "hired" : "rejected";
          }        

          // Fetch job title and employer for display
          const [jobTitle, employer] = await Promise.all([
            jobContract.title(),
            jobContract.employer(),
          ]);

          const employerName = await fetchEmployerDisplayName(employer);

          applications.push({
            jobAddress,
            jobTitle,
            employer: employerName,
            application,
            appliedAt: new Date(Number(appliedAt) * 1000).toLocaleDateString(),
            status: applicationStatus,
          });
        }
      }

      console.log("Fetched applications:", applications);
      return applications;      
    } catch (error) {
      console.error("Error fetching applications:", error);
      return [];
    }
  }

  useEffect(() => {
    const fetchApplications = async () => {
      if (contracts?.jobFactory && provider && address) {
        try {
          // Fetch all job addresses
          // const jobAddresses = await fetchAllJobAddresses(contracts.jobFactory);
  
          // Fetch applications for the current user
          const applications = await fetchMyApplications(jobAddresses, address);
          setMyApplications(applications);
        } catch (error) {
          console.error("Error fetching applications:", error);
        }
      }
    };
  
    fetchApplications();
  }, [contracts?.jobFactory, provider, address, jobAddresses]);  

  const handleWithdrawApplication = async (jobAddress: string) => {
    if (!provider || !contracts) {
      toast.error("Please connect your wallet first.");
      return;
    }
  
    try {
      const signer = await provider.getSigner();
      const jobContract = new ethers.Contract(jobAddress, PROOF_OF_WORK_JOB_ABI, signer);
  
      // Call the withdrawApplication function
      const txPromise = jobContract.withdrawApplication();
  
      toast.promise(
        txPromise,
        {
          loading: "Please wait for confirmation...",
          success: "Withdrawing Application...",
          error: "Failed to withdraw application.",
        }
      );
  
      // Wait for the transaction to be mined
      const tx = await txPromise;
      await tx.wait();
  
      toast.success("Application withdrawn successfully!");
      console.log("Application withdrawn:", tx);

      // Remove the application from myApplications
      setMyApplications((prev) =>
        prev.filter((application) => application.jobAddress !== jobAddress)
      );      
    } catch (error) {
      console.error("Error withdrawing application:", error);
      // const errorMessage = error instanceof Error ? error.message : "Failed to withdraw application.";
      // toast.error(errorMessage);
    }
  }; 

    return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <motion.section
        className="w-full min-h-[40vh] flex flex-col justify-center items-center text-center relative overflow-hidden py-16"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1, 0.1)}
      >
        <div className="container px-4 md:px-6 relative z-10">
          <motion.h1
            variants={fadeIn(0.1)}
            className="font-varien text-4xl font-bold sm:text-5xl md:text-6xl text-foreground mb-12 tracking-wider"
          >
            Find <span className="text-accent">On-Chain</span> Work
          </motion.h1>
          <motion.p
            variants={fadeIn(0.2)}
            className="mt-20 max-w-2xl mx-auto text-muted-foreground md:text-lg lg:text-xl"
          >
            <Balancer>
              Browse opportunities, apply for jobs, and get paid automatically through smart contracts. Build your
              on-chain reputation with every successful project.
            </Balancer>
          </motion.p>
        </div>
      </motion.section>
      
      {/* Main Content – moved up by reducing top padding */}
      <SectionWrapper id="jobs" padding="pt-0 md:pt-2 pb-12 md:pb-12">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="font-varien grid grid-cols-3 mb-8">
            <TabsTrigger value="browse" className="text-sm sm:text-base">
              <Briefcase className="mr-2 h-4 w-4" />
              Browse Jobs
            </TabsTrigger>
            <TabsTrigger value="active" className="text-sm sm:text-base">
              <CheckCircle className="mr-2 h-4 w-4" />
              My Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="text-sm sm:text-base">
              <Clock3 className="mr-2 h-4 w-4" />
              Applications
            </TabsTrigger>
          </TabsList>

          {/* Browse Jobs Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs by title, skills, or employer..."
                    className="pl-10 border-border focus:border-accent font-varela"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-accent/50 text-accent hover:bg-accent/10 font-varien"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-lg border border-border bg-card/50"
                >
                  <div className="space-y-2">
                    <Label htmlFor="payment-type" className="text-foreground font-varien">
                      Payment Type
                    </Label>
                    <Select value={payTypeFilter} onValueChange={setPayTypeFilter}>
                      <SelectTrigger className="border-border focus:border-accent">
                        <SelectValue placeholder="All payment types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All payment types</SelectItem>
                        <SelectItem value="WEEKLY">Weekly payments</SelectItem>
                        <SelectItem value="ONE_OFF">One-off payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-varien">Minimum Pay (KAS)</Label>
                    <div className="pt-4">
                      <Slider
                        defaultValue={[0]}
                        max={10}
                        step={0.5}
                        value={minPayFilter}
                        onValueChange={setMinPayFilter}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>0 KAS</span>
                        <span>{minPayFilter[0]} KAS</span>
                        <span>10+ KAS</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-varien">Other Filters</Label>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="open-positions" />
                        <Label htmlFor="open-positions">Only show jobs with open positions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="high-rated" />
                        <Label htmlFor="high-rated">Only high-rated employers (4.5+)</Label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Job Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <motion.div key={job.address} variants={fadeIn(0.1)}>
                    <InteractiveCard className="h-full flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-varien text-lg font-normal tracking-wider text-foreground">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">{job.employer}</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs ml-1">{job.employerRating}</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            job.payType === "WEEKLY"
                              ? "border-blue-500 text-blue-500"
                              : "border-purple-500 text-purple-500"
                          }
                        >
                          {job.payType === "WEEKLY" ? "Weekly" : "One-off"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.tags.map((tag: any) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-accent" />
                          <div>
                            <p className="font-medium text-foreground">
                              {job.payType === "WEEKLY" ? `${job.weeklyPay} KAS/week` : `${job.totalPay} KAS total`}
                            </p>
                            {job.payType === "WEEKLY" && (
                              <p className="text-xs text-muted-foreground">{job.totalPay} KAS total</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {job.payType === "WEEKLY" ? (
                            <>
                              <Calendar className="h-4 w-4 text-accent" />
                              <div>
                                <p className="font-medium text-foreground">{job.durationWeeks} weeks</p>
                                <p className="text-xs text-muted-foreground">Duration</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-accent" />
                              <div>
                                <p className="font-medium text-foreground">One-time project</p>
                                <p className="text-xs text-muted-foreground">
                                  Posted {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-accent" />
                          <div>
                            <p className="font-medium text-foreground">
                              {job.positionsFilled}/{job.positions} filled
                            </p>
                            <p className="text-xs text-muted-foreground">{job.applicants} applicants</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="flex-1 bg-accent hover:bg-accent-hover text-accent-foreground"
                              onClick={() => setSelectedJob(job)}
                            >
                              Apply Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                              <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
                              <DialogDescription>
                                Submit your application for this position at {selectedJob?.employer}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="cover-letter">Why are you a good fit for this role?</Label>
                                <Textarea
                                  id="cover-letter"
                                  placeholder="Describe your relevant experience and why you're interested in this position..."
                                  className="min-h-[150px]"
                                  value={applicationText}
                                  onChange={(e) => setApplicationText(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {setApplicationText(""); setSelectedJob(null)}}>
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                className="bg-accent hover:bg-accent-hover text-accent-foreground"
                                onClick={handleApply}
                              >
                                Submit Application
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                      </div>
                    </InteractiveCard>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-1 lg:col-span-2 text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters to find more opportunities.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Jobs Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {myJobs.length > 0 ? (
                myJobs.map((job) => (
                  <motion.div key={job.id} variants={fadeIn(0.1)}>
                    <InteractiveCard>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-varien text-lg font-normal tracking-wider text-foreground">{job.title}</h3>
                              <Badge
                                className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"
                                variant="outline"
                              >
                                Active
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">{job.employer}</span>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs ml-1">{job.employerRating}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-accent" />
                              <div>
                                <p className="font-medium text-foreground">
                                  {job.payType === "WEEKLY" ? `${job.weeklyPay} KAS/week` : `${job.totalPay} KAS total`}
                                </p>
                                {job.payType === "WEEKLY" && (
                                  <p className="text-xs text-muted-foreground">{job.totalPay} KAS total</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-accent" />
                              <div>
                                <p className="font-medium text-foreground">
                                  {new Date(job.startDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">Start date</p>
                              </div>
                            </div>

                            {job.payType === "WEEKLY" && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-accent" />
                                <div>
                                  <p className="font-medium text-foreground">
                                    {new Date(job.nextPayoutDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Next payout</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-3">
                          {job.payType === "WEEKLY" && (
                            <div className="w-full md:w-48">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>
                                  {job.payoutsMade}/{job.durationWeeks} weeks
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-accent h-2.5 rounded-full"
                                  style={{ width: `${job.progress}%` }}
                                ></div>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <Calendar className="h-4 w-4 text-accent" />
                                <div>
                                  <p className="font-medium text-foreground">Next Payment</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(job.nextPayoutDate).toLocaleDateString()} (Automatic)
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {job.payType === "ONE_OFF" && (
                              <Button className="bg-accent hover:bg-accent-hover text-accent-foreground font-varien">
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Complete & Claim
                              </Button>
                            )}

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="border-red-500/50 text-red-500 hover:bg-red-500/10 font-varien"
                                  onClick={() => setSelectedJobForDispute(job)}
                                >
                                  <AlertTriangle className="mr-1 h-4 w-4" />
                                  Open Dispute
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[525px]">
                                <DialogHeader>
                                  <DialogTitle>Open Dispute for {selectedJobForDispute?.title}</DialogTitle>
                                  <DialogDescription>
                                    Opening a dispute will create a case in the DisputeDAO for resolution by the
                                    assigned jurors.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="dispute-reason">Initial Statement</Label>
                                    <Textarea
                                      id="dispute-reason"
                                      placeholder="Describe the issue in detail. This will be your first message in the dispute thread..."
                                      className="min-h-[150px]"
                                      value={disputeReason}
                                      onChange={(e) => setDisputeReason(e.target.value)}
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <p className="mb-2">
                                      <strong>Important:</strong> Opening a dispute will:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                      <li>Create a new dispute record in the DisputeDAO contract</li>
                                      <li>Freeze any remaining funds in the job contract</li>
                                      <li>Allow both parties and jurors to submit evidence and messages</li>
                                      <li>Initiate the voting process by the assigned jurors</li>
                                    </ul>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setDisputeReason("")}>
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={handleDisputeSubmit}
                                  >
                                    <AlertTriangle className="mr-1 h-4 w-4" />
                                    Submit Dispute
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10">
                              <MessageSquare className="h-4 w-4" />
                              <span className="sr-only">Message</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </InteractiveCard>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No active jobs</h3>
                  <p className="text-muted-foreground mb-6">You don't have any active jobs at the moment.</p>
                  <Button asChild className="bg-accent hover:bg-accent-hover text-accent-foreground">
                    <Link href="/jobs">
                      Find Jobs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {myApplications.length > 0 ? (
                myApplications.map((application) => (
                  <motion.div key={application.jobAddress} variants={fadeIn(0.1)}>
                    <InteractiveCard>
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-varien text-lg font-normal tracking-wider text-foreground">{application.jobTitle}</h3>
                              <Badge
                                className={
                                  application.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"
                                    : application.status === "hired"
                                      ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"
                                      : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"
                                }
                                variant="outline"
                              >
                                {application.status === "pending"
                                  ? "Pending"
                                  : application.status === "hired"
                                    ? "Hired"
                                    : "Rejected"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{application.employer}</p>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-accent" />
                            <div>
                              <p className="font-medium text-foreground">
                                Applied on {application.appliedAt}
                              </p>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">Your application:</p>
                            <p className="line-clamp-2">{application.application}</p>
                          </div>

                          {application.status === "rejected" && application.feedback && (
                            <div className="text-sm border-l-2 border-red-500 pl-3 py-1">
                              <p className="font-medium text-foreground mb-1">Feedback:</p>
                              <p className="text-muted-foreground">{application.feedback}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
                          {application.status === "pending" && (
                            <Button 
                            variant="outline" 
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10 font-varien"
                            onClick={() => handleWithdrawApplication(application.jobAddress)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Withdraw Application
                            </Button>
                          )}

                          {application.status === "hired" && (
                            <Button className="bg-accent hover:bg-accent-hover text-accent-foreground font-varien">
                              <Briefcase className="mr-1 h-4 w-4" />
                              View Job Details
                            </Button>
                          )}

                          <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10">
                            <MessageSquare className="mr-1 h-4 w-4" />
                            Message Employer
                          </Button>
                        </div>
                      </div>
                    </InteractiveCard>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Clock3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No applications</h3>
                  <p className="text-muted-foreground mb-6">You haven't applied to any jobs yet.</p>
                  <Button asChild className="bg-accent hover:bg-accent-hover text-accent-foreground">
                    <Link href="/jobs">
                      Browse Jobs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SectionWrapper>
    </div>
  )
}

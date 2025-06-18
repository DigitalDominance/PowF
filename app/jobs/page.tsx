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
import axios from "axios"
import { toast } from "sonner"
import { useUserContext } from "@/context/UserContext"

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

// Placeholder data for my jobs
const myJobs = [
  {
    id: 101,
    title: "Backend Developer for NFT Marketplace",
    employer: "NFT World",
    employerRating: 4.6,
    payType: "WEEKLY",
    weeklyPay: "3.2",
    durationWeeks: 10,
    totalPay: "32",
    startDate: "2024-01-05",
    nextPayoutDate: "2024-01-26",
    payoutsMade: 3,
    status: "active",
    progress: 30,
  },
  {
    id: 102,
    title: "Documentation for Smart Contract SDK",
    employer: "DevDAO",
    employerRating: 4.9,
    payType: "ONE_OFF",
    totalPay: "8",
    startDate: "2024-01-15",
    status: "active",
    progress: 75,
  },
]

// Placeholder data for applications
// const myApplications = [
//   {
//     id: 201,
//     jobId: 1,
//     jobTitle: "Senior Smart Contract Developer",
//     employer: "BlockchainX Labs",
//     appliedDate: "2024-01-12",
//     status: "pending",
//     coverLetter: "I have 5 years of experience in Solidity development...",
//   },
//   {
//     id: 202,
//     jobId: 3,
//     jobTitle: "Whitepaper Technical Writer",
//     employer: "Proof Protocol",
//     appliedDate: "2024-01-19",
//     status: "hired",
//     coverLetter: "I've written whitepapers for 3 successful blockchain projects...",
//   },
//   {
//     id: 203,
//     jobId: 5,
//     jobTitle: "Smart Contract Security Audit",
//     employer: "SecureChain",
//     appliedDate: "2024-01-23",
//     status: "rejected",
//     coverLetter: "I specialize in smart contract security with a focus on DeFi protocols...",
//     feedback: "We found a candidate with more specific experience in formal verification.",
//   },
// ]

// // Placeholder data for disputes
// const myDisputes = [
//   {
//     id: 301,
//     jobId: 101,
//     jobTitle: "Backend Developer for NFT Marketplace",
//     employer: "NFT World",
//     openedDate: "2024-01-20",
//     status: "pending",
//     reason: "Payment delay for completed milestone",
//     votes: { for: 3, against: 1 },
//   },
// ]

export default function JobsPage() {
  const { contracts, provider, role, address } = useUserContext();
  const [allJobs, setAllJobs] = useState<any[]>([]);

  const fetchTags = async (jobContract: ethers.Contract) => {
    try {
        const tags = [];
        let index = 0;

        while (true) {
            try {
                const tag = await jobContract.tags(index); // Fetch tag by index
                tags.push(tag);
                index++;
            } catch (error) {
                // Break the loop when out-of-bounds error occurs
                break;
            }
        }

        console.log("Fetched tags:", tags);
        return tags;
    } catch (error) {
        console.error("Error fetching tags:", error);
        return [];
    }
  };  

  const fetchAssignedWorkersLength = async (jobContract: ethers.Contract) => {
      try {
          const assignedWorkers = await jobContract.getAssignedWorkers(); // Fetch the entire array
          console.log("Assigned Workers:", assignedWorkers);
          return assignedWorkers.length; // Return the length of the array
      } catch (error) {
          console.error("Error fetching assigned workers:", error);
          return 0;
      }
  };  

  const fetchEmployerInfo = async (wallet: string) => {
    try {
        // Check if the employer exists
        const response = await axios.head(`${process.env.NEXT_PUBLIC_API}/users/${wallet.toLowerCase()}`);
        if (response.status === 200) {
            // Fetch employer details
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/${wallet.toLowerCase()}`);
            console.log("Employer Info:", data);
            return data;
        }
    } catch (error) {
        if (typeof error === "object" && error !== null && "response" in error && (error as any).response?.status === 404) {
            console.error("Employer not found:", wallet);
        } else {
            console.error("Error fetching employer info:", error);
        }
        return null;
    }
} ;  

  const fetchJobDetails = async (jobAddresses: string[], provider: ethers.Provider) => {
    try {
      const jobs = [];
      for (const address of jobAddresses) {
          const jobContract = new ethers.Contract(address, PROOF_OF_WORK_JOB_ABI, provider);

          // Fetch job details
          const [employer, title, description, payType, weeklyPay, totalPay, durationWeeks, createdAt, positions] =
              await Promise.all([
                  jobContract.employer(),
                  jobContract.title(),
                  jobContract.description(),
                  jobContract.payType(),
                  jobContract.weeklyPay(),
                  jobContract.totalPay(),
                  jobContract.durationWeeks(),
                  jobContract.createdAt(),
                  jobContract.positions(),
              ]);

            // Fetch tags
            const tags = await fetchTags(jobContract);    
            
            // Fetch assigned workers length
            const assignedWorkersLength = await fetchAssignedWorkersLength(jobContract);            

          // Map payType to string
          const payTypeString = payType === BigInt(0) ? "WEEKLY" : "ONE_OFF";

          // Fetch employer info
          const employerInfo = await fetchEmployerInfo(employer);

          // Fetch reputation scores
          const reputationAddress = await jobContract.reputation(); // Get the ReputationSystem contract address
          const reputationContract = new ethers.Contract(reputationAddress, REPUTATION_SYSTEM_ABI, provider);
          const [workerScore, employerScore] = await reputationContract.getScores(employer);          

          jobs.push({
              address,
              employer: employerInfo.displayName,
              title,
              description,
              payType: payTypeString,
              weeklyPay: ethers.formatEther(weeklyPay),
              totalPay: ethers.formatEther(totalPay),
              durationWeeks: durationWeeks.toString(),
              createdAt: new Date(Number(createdAt) * 1000).toLocaleDateString(),
              positions: positions.toString(),
              tags,
              positionsFilled: assignedWorkersLength,
              employerRating: employerScore
          });
      }

      console.log("Fetched job details:", jobs);
      return jobs;
    } catch (error) {
        console.error("Error fetching job details:", error);
        return [];
    }    
  }  

  const fetchAllJobAddresses = async (jobFactoryContract: ethers.Contract) => {
    try {
        const jobAddresses = await jobFactoryContract.getAllJobs();
        console.log("Fetched job addresses:", jobAddresses);
        return jobAddresses;
    } catch (error) {
        console.error("Error fetching job addresses:", error);
        return [];
    }
  };  

  useEffect(() => {
    const fetchAllJobs = async () => {
      if (contracts?.jobFactory && provider) {
        try {
          // Fetch all job addresses
          const jobAddresses = await fetchAllJobAddresses(contracts.jobFactory);

          // Fetch job details
          const jobs = await fetchJobDetails(jobAddresses, provider);
          setAllJobs(jobs);
        } catch (error) {
          console.error("Error fetching allJobs:", error);
        }
      }
    };

    fetchAllJobs();
  }, [contracts?.jobFactory, provider]);
  
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
    } catch (error) {
      console.error("Error submitting application:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit application.";
      toast.error(errorMessage);
    }
  };  

  // Handle job application
  const handleApply = () => {
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

    handleSubmitApplication(selectedJob.address, applicationText);
    // In a real implementation, this would call a smart contract function
  }

  // Handle dispute submission
  const handleDisputeSubmit = () => {
    console.log("Dispute submitted for job:", selectedJobForDispute?.id, "with reason:", disputeReason)
    // Reset dispute form
    setDisputeReason("")
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
          const [applicantAddress, application, appliedAt, isActive] = await jobContract.getApplicant(userAddress);

          // Check if the user is already a worker
          const isWorker = await jobContract.isWorker(userAddress);
          // const isActiveWorker = await jobContract.activeWorker(userAddress);          

          // Fetch job title and employer for display
          const [jobTitle, employer] = await Promise.all([
            jobContract.title(),
            jobContract.employer(),
          ]);

          applications.push({
            jobAddress,
            jobTitle,
            employer,
            application,
            appliedAt: new Date(Number(appliedAt) * 1000).toLocaleDateString(),
            status: isActive === false ? 'rejected' : isWorker === false ? 'pending' : 'hired',
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
          const jobAddresses = await fetchAllJobAddresses(contracts.jobFactory);
  
          // Fetch applications for the current user
          const applications = await fetchMyApplications(jobAddresses, address);
          setMyApplications(applications);
        } catch (error) {
          console.error("Error fetching applications:", error);
        }
      }
    };
  
    fetchApplications();
  }, [contracts?.jobFactory, provider, address]);  

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
            className="font-varien text-4xl font-bold sm:text-5xl md:text-6xl text-foreground mb-6 tracking-wider"
          >
            Find <span className="text-accent">On-Chain</span> Work
          </motion.h1>
          <motion.p
            variants={fadeIn(0.2)}
            className="mt-22 max-w-2xl mx-auto text-muted-foreground md:text-lg lg:text-xl"
          >
            <Balancer>
              Browse opportunities, apply for jobs, and get paid automatically through smart contracts. Build your
              on-chain reputation with every successful project.
            </Balancer>
          </motion.p>
        </div>
      </motion.section>
      
      {/* Main Content */}
      <SectionWrapper id="jobs" padding="py-8 md:py-12">
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
                            <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 font-varien">
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

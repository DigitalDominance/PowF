"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type React from "react"
import { useContext, useEffect, useState } from "react"

import {
    ArrowRight,
    CheckCircle,
    Users,
    Lock,
    FileText,
    DollarSign,
    Eye,
    MessageSquare,
    Calendar,
    Star,
    Plus,
    Edit,
    Trash2,
} from "lucide-react"
import { motion } from "framer-motion"
import { InteractiveCard } from "@/components/custom/interactive-card"
import { Balancer } from "react-wrap-balancer"
import { useContracts } from "@/hooks/useContract"
// import { toast, useToast } from "@/components/ui/use-toast"
import { toast } from "sonner"
import { ethers, EventLog } from "ethers"
import { useUserContext } from "@/context/UserContext"
import PROOF_OF_WORK_JOB_ABI from '@/lib/contracts/ProofOfWorkJob.json';

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

export default function PostJobPage() {
    const { wallet, role, contracts, provider } = useUserContext();
    const [paymentType, setPaymentType] = useState<"weekly" | "oneoff">("weekly")
    const [formData, setFormData] = useState<{
        jobTitle: string;
        description: string;
        payAmount: string;
        duration: string;
        positions: string;
        tags: string[];
    }>({          
        jobTitle: "",
        description: "",
        payAmount: "",
        duration: "",
        positions: "1",
        tags: []
    })

    const [employerJobs, setEmployerJobs] = useState<string[]>([]);

    const [jobDetails, setJobDetails] = useState<any[]>([]);    

    // Placeholder data for applicants
    const applicants = [
        {
            id: 1,
            name: "Alex Chen",
            jobTitle: "Senior React Developer",
            experience: "5 years",
            rating: 4.8,
            appliedDate: "2024-01-16",
            status: "pending",
            avatar: "AC",
            skills: ["React", "TypeScript", "Web3"],
        },
        {
            id: 2,
            name: "Sarah Johnson",
            jobTitle: "Senior React Developer",
            experience: "7 years",
            rating: 4.9,
            appliedDate: "2024-01-15",
            status: "reviewed",
            avatar: "SJ",
            skills: ["React", "Next.js", "Solidity"],
        },
        {
            id: 3,
            name: "Mike Rodriguez",
            jobTitle: "Smart Contract Auditor",
            experience: "4 years",
            rating: 4.7,
            appliedDate: "2024-01-12",
            status: "pending",
            avatar: "MR",
            skills: ["Solidity", "Security", "DeFi"],
        },
    ]

    const instructionSteps = [
        {
            icon: <FileText className="h-8 w-8 text-accent" />,
            title: "Create Your Listing",
            description: "Define job requirements, payment terms, and duration. All terms are locked in smart contracts.",
        },
        {
            icon: <Lock className="h-8 w-8 text-accent" />,
            title: "Lock Funds",
            description: "Deposit KAS tokens into the job contract. Funds are held securely until work completion.",
        },
        {
            icon: <Users className="h-8 w-8 text-accent" />,
            title: "Review Applicants",
            description: "Browse worker profiles, check on-chain reputation scores, and select the best candidates.",
        },
        {
            icon: <CheckCircle className="h-8 w-8 text-accent" />,
            title: "Automatic Payments",
            description: "Workers get paid automatically based on your predefined schedule. No manual intervention needed.",
        },
    ]

    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleAddTag = (tag: string) => {
        if (tag && !formData.tags.includes(tag)) {
            setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
        }
    };
    
    const handleRemoveTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    };    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Check if the user has the 'employer' role
        if (role !== "employer") {
            toast.error("Only employers can create job listings.", {
                duration: 3000,
            });
            return;
        }

        if (!contracts || !contracts.jobFactory) {
            toast.error(
                "Please connect your wallet first",
                {
                    duration: 3000, // Example of a valid property; adjust as needed
                }
            )
            return;
        }        
        // Placeholder for smart contract integration
        console.log("Job posting data:", { paymentType, ...formData })
        // Reset form or show success message
        try {
            const weeklyPayWei = paymentType === 'weekly' ? ethers.parseEther(formData.payAmount) : BigInt(0);
            const durationWeeks = BigInt(formData.duration || '0');
            const totalPayWei = paymentType === 'oneoff' ? ethers.parseEther(formData.payAmount) : ethers.parseEther(formData.payAmount) * durationWeeks;

            const fee = (totalPayWei * BigInt(75)) / BigInt(10000);
            const value = paymentType === 'weekly'
                ? weeklyPayWei * durationWeeks + fee
                : totalPayWei + fee;

            console.log('value', value, fee, formData)

            const txPromise = contracts.jobFactory.createJob(
                wallet,
                paymentType === 'weekly' ? 0 : 1,
                weeklyPayWei,
                durationWeeks,
                totalPayWei,
                formData.jobTitle,
                formData.description,
                formData.positions,
                formData.tags,
                { value }
            );

            toast.promise(
                txPromise,
                {
                    loading: "Please wait for confirmation...",
                    success: "Confirming...",
                    error: (error) => `Failed to create job: ${error.message}`
                }
            );

            const tx = await txPromise;
            await tx.wait();

            toast.success(
                "Job created successfully!"
            )
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error creating job:", error.message);
            } else {
                console.error("Error creating job:", error);
            }
        }
    }

    const fetchJobsByEmployerFromEvents = async (employerAddress: string) => {
        try {
            if (!contracts || !contracts.jobFactory) {
                toast.error(
                    "Please connect your wallet first",
                    {
                        duration: 3000, // Example of a valid property; adjust as needed
                    }
                )
                return;
            }        
            // Get the JobCreated event filter
            const filter = contracts.jobFactory.filters.JobCreated(null, employerAddress);
    
            // Query past events
            const events = await contracts.jobFactory.queryFilter(filter);
    
            // Extract job addresses from the events
            const jobs = events.map((event) => (event as EventLog).args?.jobAddress);
    
            console.log("Jobs posted by employer (from events):", jobs);
            return jobs;
        } catch (error) {
            console.error("Error fetching jobs by employer from events:", error);
            return [];
        }
    };    

    useEffect(() => {
        const loadJobs = async () => {
            if(wallet) {
                const jobs = await fetchJobsByEmployerFromEvents(wallet);
                setEmployerJobs(jobs || []);
            }
        }

        loadJobs();
    }, [wallet]);

    const fetchJobDetails = async (jobAddresses: string[], provider: ethers.Provider) => {
        try {
            const jobs = [];
            for (const address of jobAddresses) {
                const jobContract = new ethers.Contract(address, PROOF_OF_WORK_JOB_ABI, provider);
    
                // Fetch job details
                const [employer, title, description, duration, positions, payType, totalPay, createdAt, totalApplications] = await Promise.all([
                    jobContract.employer(),
                    jobContract.title(),
                    jobContract.description(),
                    jobContract.durationWeeks(),
                    jobContract.positions(),
                    jobContract.payType(),
                    jobContract.totalPay(),
                    jobContract.createdAt(),
                    jobContract.getTotalApplications(), // Fetch total applications
                ]);

                console.log('payType', payType)
    
                jobs.push({
                    address,
                    employer,
                    title,
                    description,
                    duration,
                    positions: positions.toString(),
                    payType: payType === BigInt(0) ? "weekly" : "oneoff",
                    totalPay: ethers.formatEther(totalPay),
                    postedDate: Number(createdAt) * 1000,
                    applicants: totalApplications.toString(), // Convert BigInt to string
                });
            }
    
            console.log("Fetched job details:", jobs);
            return jobs;
        } catch (error) {
            console.error("Error fetching job details:", error);
            return [];
        }
    };

    useEffect(() => {
        const loadJobDetails = async () => {
            if (employerJobs.length > 0 && provider) {
                const jobs = await fetchJobDetails(employerJobs, provider);
                console.log('Job Details', jobs)
                setJobDetails(jobs);
            }
        };
    
        loadJobDetails();
    }, [employerJobs]);    
    
        return (
            <div className="flex flex-col items-center">
              {/* Hero Section */}
              <motion.section
                className="w-full min-h-[60vh] flex flex-col justify-center items-center text-center relative overflow-hidden py-10"
                initial="hidden"
                animate="visible"
                variants={staggerContainer(0.1, 0.1)}
              >
                <div className="container px-4 md:px-6 relative z-10">
                  <motion.h1
                    variants={fadeIn(0.1)}
                    className="font-varien text-4xl font-bold tracking-wider sm:text-5xl md:text-6xl text-foreground mb-6"
                  >
                    Post a <span className="text-accent">Job</span>
                  </motion.h1>
                  <motion.p
                    variants={fadeIn(0.2)}
                    className="mt-20 max-w-2xl mx-auto text-muted-foreground md:text-lg lg:text-xl"
                  >
                    <Balancer>
                      Hire top talent with guaranteed payments and transparent terms. All job contracts are secured
                      on-chain for maximum trust and accountability.
                    </Balancer>
                  </motion.p>
                </div>
              </motion.section>

              <SectionWrapper id="how-it-works" padding="pt-0 md:pt-2 pb-12 md:pb-16">
                <motion.div variants={fadeIn()} className="text-center mb-12">
                  <h2 className="font-varien text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
                    How <span className="text-accent">It Works</span>
                  </h2>
                  <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    <Balancer>Simple steps to post your job and start hiring with blockchain-powered security.</Balancer>
                  </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {instructionSteps.map((step, index) => (
                        <motion.div variants={fadeIn(index * 0.1)} key={step.title}>
                            <InteractiveCard className="h-full text-center">
                                <div className="flex flex-col items-center">
                                    <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">{step.icon}</div>
                                    <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        <Balancer>{step.description}</Balancer>
                                    </p>
                                </div>
                            </InteractiveCard>
                        </motion.div>
                    ))}
                </div>
            </SectionWrapper>

            {/* Create Listing Section */}
            <SectionWrapper id="create-listing" padding="py-12 md:py-16">
                <motion.div variants={fadeIn()} className="text-center mb-12">
                    <h2 className="font-varien text-3xl font-bold tracking-wider sm:text-4xl text-foreground">
                        Create Your <span className="text-accent">Listing</span>
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        <Balancer>
                            Fill out the details below to create your job posting and lock funds in the smart contract.
                        </Balancer>
                    </p>
                </motion.div>

                <motion.div variants={fadeIn(0.2)} className="max-w-2xl mx-auto">
                    <InteractiveCard>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Payment Type */}
                            <div className="space-y-2">
                                <Label htmlFor="payment-type" className="text-foreground font-varien">
                                    Payment Type
                                </Label>
                                <Select value={paymentType} onValueChange={(value: "weekly" | "oneoff") => setPaymentType(value)}>
                                    <SelectTrigger className="border-border focus:border-accent">
                                        <SelectValue placeholder="Select payment type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly Payments</SelectItem>
                                        <SelectItem value="oneoff">One-off Payment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Pay Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="pay-amount" className="text-foreground font-varien">
                                    {paymentType === "weekly" ? "Weekly Pay (KAS)" : "Total Pay (KAS)"}
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="pay-amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.payAmount}
                                        onChange={(e) => handleInputChange("payAmount", e.target.value)}
                                        className="pl-10 border-border focus:border-accent"
                                        required
                                    />
                                </div>
                            </div>                      

                            {/* Duration (only for weekly) */}
                            {paymentType === "weekly" && (
                                <div className="space-y-2">
                                    <Label htmlFor="duration" className="text-foreground font-varien">
                                        Duration (Weeks)
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="duration"
                                            type="number"
                                            min="1"
                                            placeholder="8"
                                            value={formData.duration}
                                            onChange={(e) => handleInputChange("duration", e.target.value)}
                                            className="pl-10 border-border focus:border-accent"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Job Title */}
                            <div className="space-y-2">
                                <Label htmlFor="job-title" className="text-foreground font-varien">
                                    Job Title
                                </Label>
                                <Input
                                    id="job-title"
                                    type="text"
                                    placeholder="e.g., Senior React Developer"
                                    value={formData.jobTitle}
                                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                                    className="border-border focus:border-accent"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-foreground font-varien">
                                    Job Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the role, requirements, and expectations..."
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    className="min-h-[120px] border-border focus:border-accent resize-none"
                                    required
                                />
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="tags" className="text-foreground font-varien">
                                    Tags
                                </Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="flex items-center gap-2 text-xs cursor-pointer font-semibold"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                ✕
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="tags"
                                        type="text"
                                        placeholder="Type a tag and press Enter (e.g., staking, blockchain, react)"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddTag(e.currentTarget.value.trim());
                                                e.currentTarget.value = ""; // Clear input after adding tag
                                            }
                                        }}
                                        className="border-border focus:border-accent"
                                    />
                                </div>
                            </div>                              

                            {/* Number of Positions */}
                            <div className="space-y-2">
                                <Label htmlFor="positions" className="text-foreground font-varien">
                                    Number of Positions
                                </Label>
                                <Input
                                    id="positions"
                                    type="number"
                                    min="1"
                                    value={formData.positions}
                                    onChange={(e) => handleInputChange("positions", e.target.value)}
                                    className="border-border focus:border-accent"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-accent hover:bg-accent-hover text-accent-foreground shadow-lg hover:shadow-accent/40 transition-all duration-300 transform hover:scale-105 group"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Create Job Listing
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    </InteractiveCard>
                </motion.div>
            </SectionWrapper>

            {/* Current Listings Section */}
            <SectionWrapper id="current-listings" padding="py-12 md:py-16">
                <motion.div variants={fadeIn()} className="text-center mb-12">
                    <h2 className="font-varien text-3xl font-bold tracking-wider sm:text-4xl text-foreground">
                        Your Current <span className="text-accent">Listings</span>
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        <Balancer>Manage your active job postings and track applicant interest.</Balancer>
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobDetails.map((listing, index) => (
                        <motion.div variants={fadeIn(index * 0.1)} key={listing.address}>
                            <InteractiveCard className="h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">{listing.title}</h3>
                                        {/* <Badge
                                            variant={listing.status === "active" ? "default" : "secondary"}
                                            className={listing.status === "active" ? "bg-accent text-accent-foreground" : ""}
                                        >
                                            {listing.status}
                                        </Badge> */}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment:</span>
                                        <span className="font-medium text-foreground">{`${listing.totalPay} KAS`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Type:</span>
                                        <span className="font-medium text-foreground capitalize">{listing.payType}</span>
                                    </div>
                                    {listing.payType === "weekly" && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Duration:</span>
                                            <span className="font-medium text-foreground">{listing.duration}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Positions:</span>
                                        <span className="font-medium text-foreground">{listing.positions}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Applicants:</span>
                                        <span className="font-medium text-accent">{listing.applicants}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Posted:</span>
                                        <span className="font-medium text-foreground">
                                            {new Date(listing.postedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full mt-4 border-accent/50 text-accent hover:bg-accent/10 hover:text-accent group"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </Button>
                            </InteractiveCard>
                        </motion.div>
                    ))}
                </div>
            </SectionWrapper>

            {/* Applicants Section */}
            <SectionWrapper id="applicants" padding="py-12 md:py-16 pb-24">
                <motion.div variants={fadeIn()} className="text-center mb-12">
                    <h2 className="font-varien tracking-wider text-3xl font-bold sm:text-4xl text-foreground">
                        Review <span className="text-accent">Applicants</span>
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        <Balancer>Evaluate candidates based on their on-chain reputation and experience.</Balancer>
                    </p>
                </motion.div>

                <div className="space-y-6">
                    {applicants.map((applicant, index) => (
                        <motion.div variants={fadeIn(index * 0.1)} key={applicant.id}>
                            <InteractiveCard>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={`https://effigy.im/a/${applicant.name}.svg`} alt={applicant.name} />
                                            <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                                                {applicant.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground">{applicant.name}</h3>
                                            <p className="text-sm text-muted-foreground">Applied for: {applicant.jobTitle}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-sm text-muted-foreground">{applicant.experience} experience</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                    <span className="text-sm font-medium text-foreground">{applicant.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-3">
                                        <div className="flex flex-wrap gap-2">
                                            {applicant.skills.map((skill) => (
                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={applicant.status === "reviewed" ? "default" : "secondary"}
                                                className={applicant.status === "reviewed" ? "bg-accent text-accent-foreground" : ""}
                                            >
                                                {applicant.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(applicant.appliedDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="border-accent/50 text-accent hover:bg-accent/10">
                                                <MessageSquare className="mr-1 h-4 w-4" />
                                                Message
                                            </Button>
                                            <Button size="sm" className="bg-accent hover:bg-accent-hover text-accent-foreground">
                                                <CheckCircle className="mr-1 h-4 w-4" />
                                                Accept
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </InteractiveCard>
                        </motion.div>
                    ))}
                </div>
            </SectionWrapper>
        </div>
    )
}

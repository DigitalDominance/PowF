"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type React from "react";
import { useEffect, useState } from "react";

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
} from "lucide-react";
import { motion } from "framer-motion";
import { InteractiveCard } from "@/components/custom/interactive-card";
import { Balancer } from "react-wrap-balancer";
import { toast } from "sonner";
import { ethers, EventLog } from "ethers";
import { fetchEmployerInfo, useUserContext } from "@/context/UserContext";
import PROOF_OF_WORK_JOB_ABI from "@/lib/contracts/ProofOfWorkJob.json";
import REPUTATION_SYSTEM_ABI from "@/lib/contracts/ReputationSystem.json";

const fadeIn = (delay = 0, duration = 0.5) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay, duration, ease: "easeOut" } },
});

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

const SectionWrapper = ({
  children,
  className,
  id,
  padding = "py-16 md:py-20 lg:py-24",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  padding?: string;
}) => (
  <section id={id} className={`w-full relative ${padding} ${className}`}>
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/3 dark:via-black/5 to-transparent opacity-20" />
    <div className="container px-4 md:px-6 relative z-10">{children}</div>
  </section>
);

export default function PostJobPage() {
  const { wallet, role, contracts, provider } = useUserContext();
  const [paymentType, setPaymentType] = useState<"weekly" | "oneoff">("weekly");
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
    tags: [],
  });

  const [employerJobs, setEmployerJobs] = useState<string[]>([]);
  const [jobDetails, setJobDetails] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);

  const instructionSteps = [
    {
      icon: <FileText className="h-8 w-8 text-accent" />,
      title: "Create Your Listing",
      description:
        "Define job requirements, payment terms, and duration. All terms are locked in smart contracts.",
    },
    {
      icon: <Lock className="h-8 w-8 text-accent" />,
      title: "Lock Funds",
      description:
        "Deposit KAS tokens into the job contract. Funds are held securely until work completion.",
    },
    {
      icon: <Users className="h-8 w-8 text-accent" />,
      title: "Review Applicants",
      description:
        "Browse worker profiles, check on-chain reputation scores, and select the best candidates.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-accent" />,
      title: "Automatic Payments",
      description:
        "Workers get paid automatically based on your predefined schedule. No manual intervention needed.",
    },
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== "employer") {
      toast.error("Only employers can create job listings.", { duration: 3000 });
      return;
    }
    if (!contracts?.jobFactory) {
      toast.error("Please connect your wallet first", { duration: 3000 });
      return;
    }
    try {
      const weeklyPayWei =
        paymentType === "weekly"
          ? ethers.parseEther(formData.payAmount)
          : BigInt(0);
      const durationWeeks = BigInt(formData.duration || "0");
      const totalPayWei =
        paymentType === "oneoff"
          ? ethers.parseEther(formData.payAmount)
          : ethers.parseEther(formData.payAmount) * durationWeeks;
      const fee = (totalPayWei * BigInt(75)) / BigInt(10000);
      const value =
        paymentType === "weekly"
          ? weeklyPayWei * durationWeeks + fee
          : totalPayWei + fee;

      const txPromise = contracts.jobFactory.createJob(
        wallet,
        paymentType === "weekly" ? 0 : 1,
        weeklyPayWei,
        durationWeeks,
        totalPayWei,
        formData.jobTitle,
        formData.description,
        formData.positions,
        formData.tags,
        { value }
      );

      toast.promise(txPromise, {
        loading: "Please wait for confirmation...",
        success: "Confirming...",
        error: (err) => `Failed to create job: ${err.message}`,
      });

      const tx = await txPromise;
      await tx.wait();
      toast.success("Job created successfully!");
    } catch (err: any) {
      console.error("Error creating job:", err);
    }
  };

  const fetchJobsByEmployerFromEvents = async (employerAddress: string) => {
    try {
      if (!contracts?.jobFactory) {
        toast.error("Please connect your wallet first", { duration: 3000 });
        return [];
      }
      const filter = contracts.jobFactory.filters.JobCreated(
        null,
        employerAddress
      );
      const events = await contracts.jobFactory.queryFilter(filter);
      return events.map((ev) => (ev as EventLog).args?.jobAddress);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    if (wallet) {
      fetchJobsByEmployerFromEvents(wallet).then((jobs) =>
        setEmployerJobs(jobs || [])
      );
    }
  }, [wallet]);

  const fetchJobDetails = async (
    jobAddresses: string[],
    provider: ethers.Provider
  ) => {
    try {
      const results: any[] = [];
      for (const addr of jobAddresses) {
        const c = new ethers.Contract(addr, PROOF_OF_WORK_JOB_ABI, provider);
        const [
          _emp,
          title,
          _desc,
          duration,
          positions,
          payType,
          totalPay,
          createdAt,
          totalApps,
        ] = await Promise.all([
          c.employer(),
          c.title(),
          c.description(),
          c.durationWeeks(),
          c.positions(),
          c.payType(),
          c.totalPay(),
          c.createdAt(),
          c.getTotalApplications(),
        ]);
        results.push({
          address: addr,
          title,
          duration,
          positions: positions.toString(),
          payType: payType === BigInt(0) ? "weekly" : "oneoff",
          totalPay: ethers.formatEther(totalPay),
          postedDate: Number(createdAt) * 1000,
          applicants: totalApps.toString(),
        });
      }
      return results;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    if (employerJobs.length && provider) {
      fetchJobDetails(employerJobs, provider).then(setJobDetails);
    }
  }, [employerJobs]);

  const fetchTags = async (c: ethers.Contract) => {
    const tags: string[] = [];
    let i = 0;
    while (true) {
      try {
        tags.push(await c.tags(i++));
      } catch {
        break;
      }
    }
    return tags;
  };

  const fetchApplicantsForJobs = async (
    jobAddresses: string[],
    provider: ethers.Provider
  ) => {
    const all: any[] = [];
    for (const addr of jobAddresses) {
      const c = new ethers.Contract(addr, PROOF_OF_WORK_JOB_ABI, provider);
      const [title] = await Promise.all([c.title()]);
      const addresses = await c.getAllApplicants();
      const tags = await fetchTags(c);
      const repAddr = await c.reputation();
      const rep = new ethers.Contract(repAddr, REPUTATION_SYSTEM_ABI, provider);
      for (const a of addresses) {
        const [addrDetail, application, appliedAt, isActive] = await c.getApplicant(
          a
        );
        const isCurrent = await c.isWorker(a);
        const [workerScore] = await rep.getScores(a);
        const info = await fetchEmployerInfo(a);
        all.push({
          id: `${addr}-${a}`,
          address: a,
          jobAddress: addr,
          jobTitle: title,
          name: info.displayName,
          application,
          appliedDate: Number(appliedAt) * 1000,
          status: isCurrent ? "reviewed" : "pending",
          rating: workerScore,
          tags,
        });
      }
    }
    return all;
  };

  useEffect(() => {
    if (employerJobs.length && provider) {
      fetchApplicantsForJobs(employerJobs, provider).then(setApplicants);
    }
  }, [employerJobs]);

  const updateApplicantStatus = (id: string) => {
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: "reviewed" } : app
      )
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <motion.section
        className="w-full min-h-[40vh] flex flex-col justify-center items-center text-center relative overflow-hidden py-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1, 0.1)}
      >
        <div className="container px-4 md:px-6 relative z-10">
          <motion.h1
            variants={fadeIn(0.1)}
            className="font-varien text-[4rem] font-bold tracking-wider sm:text-[3rem] md:text-[3rem] lg:text-[5rem] text-foreground mb-6"
          >
            Post a <span className="text-accent">Job</span>
          </motion.h1>
          <motion.p
            variants={fadeIn(0.2)}
            className="mt-10 max-w-2xl mx-auto text-muted-foreground md:text-lg lg:text-xl"
          >
            <Balancer>
              Hire top talent with guaranteed payments and transparent terms.
              All job contracts are secured on-chain for maximum trust and
              accountability.
            </Balancer>
          </motion.p>
        </div>
      </motion.section>

      {/* How It Works */}
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
          {instructionSteps.map((step, i) => (
            <motion.div variants={fadeIn(i * 0.1)} key={step.title}>
              <InteractiveCard className="h-full text-center">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-accent/10 mb-4 inline-block">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {step.title}
                  </h3>
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
            <Balancer>Fill out the details below to create your job posting and lock funds in the smart contract.</Balancer>
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
                <Select
                  value={paymentType}
                  onValueChange={(v: "weekly" | "oneoff") => setPaymentType(v)}
                >
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

              {/* Duration */}
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
                  {formData.tags.map((tag, i) => (
                    <Badge
                      key={i}
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
                <Input
                  id="tags"
                  type="text"
                  placeholder="Type a tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(e.currentTarget.value.trim());
                      e.currentTarget.value = "";
                    }
                  }}
                  className="border-border focus:border-accent"
                />
              </div>

              {/* Positions */}
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
          {jobDetails.length > 0 ? (
            jobDetails.map((listing, i) => (
              <motion.div variants={fadeIn(i * 0.1)} key={listing.address}>
                <InteractiveCard className="h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {listing.title}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="font-medium text-foreground">
                        {listing.totalPay} KAS
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium text-foreground capitalize">
                        {listing.payType}
                      </span>
                    </div>
                    {listing.payType === "weekly" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium text-foreground">
                          {listing.duration}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Positions:</span>
                      <span className="font-medium text-foreground">
                        {listing.positions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applicants:</span>
                      <span className="font-medium text-accent">
                        {listing.applicants}
                      </span>
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
            ))
          ) : (
            <motion.div
              variants={fadeIn()}
              key="no-listings"
              className="col-span-full flex justify-center"
            >
              <InteractiveCard className="max-w-md w-full flex flex-col items-center justify-center text-center py-10">
                <FileText className="h-12 w-12 text-accent mb-4" />
                <h3 className="font-varien text-lg font-semibold text-accent mb-2">
                  No Listings Found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create a listing above to get started.
                </p>
              </InteractiveCard>
            </motion.div>
          )}
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
          {applicants.length > 0 ? (
            applicants.map((applicant, i) => (
              <motion.div variants={fadeIn(i * 0.1)} key={applicant.id}>
                <InteractiveCard>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`https://effigy.im/a/${applicant.address}.svg`}
                          alt={applicant.address}
                        />
                        <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                          {applicant.address.charAt(2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {applicant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Applied for: {applicant.jobTitle}
                        </p>
                        <div>
                          {applicant.application.length > 100 ? (
                            <>
                              <p className="text-sm text-muted-foreground">
                                {applicant.showFullApplication
                                  ? applicant.application
                                  : `${applicant.application.slice(0, 100)}...`}
                              </p>
                              <a
                                href="#"
                                className="text-blue-500 hover:underline text-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setApplicants((prev) =>
                                    prev.map((a) =>
                                      a.id === applicant.id
                                        ? {
                                            ...a,
                                            showFullApplication:
                                              !a.showFullApplication,
                                          }
                                        : a
                                    )
                                  );
                                }}
                              >
                                {applicant.showFullApplication
                                  ? "View Less"
                                  : "View More"}
                              </a>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {applicant.application}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {applicant.experience} experience
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-foreground">
                              {applicant.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3">
                      <div className="flex flex-wrap gap-2">
                        {applicant.tags.map((tag: any) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            applicant.status === "reviewed" ? "default" : "secondary"
                          }
                          className={
                            applicant.status === "reviewed"
                              ? "bg-accent text-accent-foreground"
                              : ""
                          }
                        >
                          {applicant.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(applicant.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-accent/50 text-accent hover:bg-accent/10"
                        >
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent-hover text-accent-foreground"
                          onClick={async () => {
                            try {
                              if (!provider) {
                                toast.error("Provider is not available. Please connect your wallet.");
                                return;
                              }
                              const signer = await provider.getSigner();
                              const c = new ethers.Contract(
                                applicant.jobAddress,
                                PROOF_OF_WORK_JOB_ABI,
                                signer
                              );
                              const tx = await c.acceptApplication(applicant.address);
                              await tx.wait();
                              toast.success("Application accepted successfully!");
                              updateApplicantStatus(applicant.id);
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to accept application.");
                            }
                          }}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={async () => {
                            try {
                              if (!provider) {
                                toast.error("Provider is not available. Please connect your wallet.");
                                return;
                              }
                              const signer = await provider.getSigner();
                              const c = new ethers.Contract(
                                applicant.jobAddress,
                                PROOF_OF_WORK_JOB_ABI,
                                signer
                              );
                              const tx = await c.declineApplication(applicant.address);
                              await tx.wait();
                              toast.success("Application declined successfully!");
                              updateApplicantStatus(applicant.id);
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to decline application.");
                            }
                          }}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            ))
          ) : (
            <motion.div
              variants={fadeIn()}
              key="no-applicants"
              className="col-span-full flex justify-center"
            >
              <InteractiveCard className="max-w-full flex flex-col items-center justify-center text-center py-10">
                <Users className="h-12 w-12 text-accent mb-4" />
                <h3 className="font-varien text-lg font-semibold text-accent mb-2">
                  No Applicants Found
                </h3>
                <p className="text-sm text-muted-foreground">
                  No applicants have applied yet.
                </p>
              </InteractiveCard>
            </motion.div>
          )}
        </div>
      </SectionWrapper>
    </div>
  );
}

"use client"

import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { BrowserProvider, type Eip1193Provider, ethers, type EventLog } from "ethers"
import type React from "react"
import { createContext, useState, useContext, useMemo, useEffect } from "react"
import JOB_FACTORY_ABI from "../lib/contracts/JobFactory.json"
import DISPUTE_DAO_ABI from "../lib/contracts/DisputeDAO.json"
import REPUTATION_SYSTEM_ABI from "../lib/contracts/ReputationSystem.json"
import PROOF_OF_WORK_JOB_ABI from "../lib/contracts/ProofOfWorkJob.json"
import axios from "axios"
import { toast } from "sonner"

interface UserContextType {
  wallet: string
  displayName: string
  role: string
  setUserData: (data: { wallet: string; displayName: string; role: string }) => void
  contracts: { jobFactory: ethers.Contract; disputeDAO: ethers.Contract } | null
  provider: BrowserProvider | null
  address: string | undefined
  isConnected: boolean
  allJobs: any[]
  jobAddresses: string[]
  setJobAddresses: React.Dispatch<React.SetStateAction<string[]>>
  myJobs: any[]
  disputes: any[]
  setDisputes: React.Dispatch<React.SetStateAction<any[]>>
  myDisputes: any[]
  employerJobs: string[]
  setEmployerJobs: React.Dispatch<React.SetStateAction<string[]>>
  jobDetails: any[]
  setJobDetails: React.Dispatch<React.SetStateAction<any[]>>
  applicants: any[]
  setApplicants: React.Dispatch<React.SetStateAction<any[]>>
  sendMessage: (disputeId: string, content: string) => void
  sendP2PMessage: (to: string, content: string) => Promise<void>
  fetchP2PMessages: (peer: string, page?: number, limit?: number) => Promise<any[]>
  setMyDisputes: React.Dispatch<React.SetStateAction<any[]>>
  fetchConversations: () => Promise<any[]>
  submitApplication: (jobAddress: string, applicationText: string) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Cache for employer information
const employerInfoCache: Record<string, any> = {}
const pendingPromises: Record<string, { promise: Promise<any>; isPending: boolean }> = {};  // Cache for pending promises

export const fetchEmployerInfo = async (wallet: string) => {
  const normalizedWallet = wallet.toLowerCase()

  // Check if the employer info is already cached
  if (employerInfoCache[normalizedWallet]) {
    return employerInfoCache[normalizedWallet]
  }

  // Check if a promise for this wallet is already pending
  if (pendingPromises[normalizedWallet]) {
    return pendingPromises[normalizedWallet].promise
  }

  // Create a new promise and store it in the pendingPromises cache
  const promise = (async () => {
    try {
      // Check if the employer exists
      const response = await axios.head(`${process.env.NEXT_PUBLIC_API}/users/${normalizedWallet}`)

      if (response.status === 200) {
        // Fetch employer details
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/${normalizedWallet}`)
        // Cache the employer info
        employerInfoCache[normalizedWallet] = data
        return data
      }
      return null
    } catch (error) {
      console.error(`Error fetching employer info for wallet ${wallet}:`, error)
      return null
    } finally {
      // Mark the promise as resolved
      pendingPromises[normalizedWallet].isPending = false;
    }
  })()

  // Store the promise and its state in the cache
  pendingPromises[normalizedWallet] = { promise, isPending: true };
  return promise
}

export const fetchEmployerAvatar = async (employerAddress: string) => {
  try {
    const employerInfo = await fetchEmployerInfo(employerAddress)
    if (employerInfo) {
      return employerInfo.profileImageUrl || `https://effigy.im/a/${employerAddress}.svg` // Return a default avatar if none is set
    } else {
      console.error("Employer not found for address:", employerAddress)
      return `https://effigy.im/a/${employerAddress}.svg` // Return a default avatar if the employer is not found
    }
  } catch (error) {
    console.error("Error fetching employer avatar:", error)
    return `https://effigy.im/a/${employerAddress}.svg` // Return a default avatar in case of an error
  }
}

export const fetchEmployerDisplayName = async (employerAddress: string) => {
  try {
    const employerInfo = await fetchEmployerInfo(employerAddress)
    if (employerInfo) {
      return employerInfo.displayName
    } else {
      console.error("Employer not found for address:", employerAddress)
      return "Unknown Employer"
    }
  } catch (error) {
    return "Unknown Employer"
  }
}

export const getAverageRating = async (reputationContract: ethers.Contract, userAddress: string) => {
  try {
    const [average, totalRatings] = await reputationContract.getAverageRating(userAddress)

    return { averageRating: Number(average) / 100, totalRatings }
  } catch (error) {
    return null
  }
}

const fetchAssignedWorkersLength = async (jobContract: ethers.Contract) => {
  try {
    const assignedWorkers = await jobContract.getAssignedWorkers() // Fetch the entire array

    return assignedWorkers.length // Return the length of the array
  } catch (error) {
    return 0
  }
}

const fetchAllJobAddresses = async (jobFactoryContract: ethers.Contract) => {
  try {
    const jobAddresses = await jobFactoryContract.getAllJobs();
    return jobAddresses;

  } catch (error) {
    console.error("Error fetching job addresses:", error);
    return []
  }
}

const fetchDisputeDAOAddress = async (jobFactoryContract: ethers.Contract) => {
  try {
    const disputeDAOAddress = await jobFactoryContract.disputeDAOAddress()

    return disputeDAOAddress
  } catch (error) {
    return null
  }
}

export const fetchJobsByEmployerFromEvents = async (jobFactoryContract: ethers.Contract, employerAddress: string) => {
  try {
    const events = await jobFactoryContract.queryFilter(jobFactoryContract.filters.JobCreated());

    const filteredEvents = events.filter((ev) => (ev as EventLog).args?.employer.toLowerCase() === employerAddress);
    return filteredEvents.map((ev) => (ev as EventLog).args?.jobAddress);
  } catch (err) {
    console.error(err)
    return []
  }
}

const fetchTags = async (c: ethers.Contract) => {
  const tags: string[] = []
  let i = 0
  while (true) {
    try {
      tags.push(await c.tags(i++))
    } catch {
      break
    }
  }
  return tags
}

export const fetchJobDetails = async (jobAddresses: string[], provider: ethers.Provider) => {
  try {
    const results = []
    for (const addr of jobAddresses) {
      const c = new ethers.Contract(addr, PROOF_OF_WORK_JOB_ABI, provider)
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
        jobCancelled, // Fetch the jobCancelled state
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
        c.jobCancelled(), // Check if the job is canceled
      ])
      // Only include jobs that are not canceled
      if (!jobCancelled) {
        results.push({
          address: addr,
          title,
          duration,
          positions: positions.toString(),
          payType: payType === BigInt(0) ? "weekly" : "oneoff",
          totalPay: ethers.formatEther(totalPay),
          postedDate: Number(createdAt) * 1000,
          applicants: totalApps.toString(),
        })
      }
    }
    return results
  } catch (err) {
    console.error(err)
    return []
  }
}

const fetchApplicantsForJobs = async (jobAddresses: string[], provider: ethers.Provider) => {
  const all: any[] = []
  for (const addr of jobAddresses) {
    const c = new ethers.Contract(addr, PROOF_OF_WORK_JOB_ABI, provider)
    const [title] = await Promise.all([c.title()])
    const addresses = await c.getAllApplicants()
    const tags = await fetchTags(c)
    const repAddr = await c.reputation()
    const rep = new ethers.Contract(repAddr, REPUTATION_SYSTEM_ABI, provider)
    for (const a of addresses) {
      const [addrDetail, application, appliedAt, isActive] = await c.getApplicant(a)
      const isCurrent = await c.isWorker(a)
      // const [workerScore] = await rep.getScores(a);
      const ratingData = await getAverageRating(rep, a)
      const averageRating = ratingData ? ratingData.averageRating : 0
      const info = await fetchEmployerInfo(a)
      all.push({
        id: `${addr}-${a}`,
        address: a,
        jobAddress: addr,
        jobTitle: title,
        name: info.displayName,
        application,
        appliedDate: Number(appliedAt) * 1000,
        status: isCurrent ? "reviewed" : "pending",
        rating: averageRating,
        tags,
      })
    }
  }
  return all
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // Add Authorization header if accessToken exists
  if (accessToken) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  let response = await fetch(url, options);

  // If access token is expired, refresh it
  if (response.status === 401 && refreshToken) {
    const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const { accessToken: newAccessToken } = await refreshResponse.json();
      localStorage.setItem("accessToken", newAccessToken);

      // Retry the original request with the new access token
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      response = await fetch(url, options);
    } else {
      // If refresh token is invalid, log the user out
      console.error("Refresh token expired or invalid");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.reload(); // Redirect to login page
    }
  }

  return response;
}

export async function axiosWithAuth(url: string, options: any = {}) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // Add Authorization header if accessToken exists
  if (accessToken) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  try {
    // Make the API request
    const response = await axios(url, options);
    return response;
  } catch (error: any) {
    // If access token is expired, refresh it
    if (error.response?.status === 401 && refreshToken) {
      try {
        const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, {
          refreshToken,
        });

        if (refreshResponse.status === 200) {
          const { accessToken: newAccessToken } = refreshResponse.data;
          localStorage.setItem("accessToken", newAccessToken);

          // Retry the original request with the new access token
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${newAccessToken}`,
          };
          const retryResponse = await axios(url, options);
          return retryResponse.data;
        } else {
          // If refresh token is invalid, log the user out
          console.error("Refresh token expired or invalid");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.reload(); // Redirect to login page
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.reload(); // Redirect to login page
      }
    } else {
      // Handle other errors
      console.error("API request error:", error);
      throw error;
    }
  }
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState("")
  const [allJobs, setAllJobs] = useState<any[]>([]) // Add this
  const [jobAddresses, setJobAddresses] = useState<string[]>([]) // Add this
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [disputes, setDisputes] = useState<any[]>([])
  const [myDisputes, setMyDisputes] = useState<any[]>([])
  const [employerJobs, setEmployerJobs] = useState<string[]>([])
  const [jobDetails, setJobDetails] = useState<any[]>([])
  const [applicants, setApplicants] = useState<any[]>([])

  // Wallet and contract state
  const { address, isConnected } = useAppKitAccount()

  // const randomWallet = useMemo(() => ethers.Wallet.createRandom(), []);

  const publicProvider = useMemo(() => {
    return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL) // Replace with your RPC URL
  }, []);

  // const randomSigner = useMemo(() => {
  //   return randomWallet.connect(publicProvider);
  // }, [randomWallet, publicProvider]);

  const { walletProvider } = useAppKitProvider("eip155")
  const provider = useMemo(() => {
    if (!walletProvider) return null
    return new BrowserProvider(walletProvider as Eip1193Provider)
  }, [walletProvider])

  const [contracts, setContracts] = useState<{ jobFactory: ethers.Contract; disputeDAO: ethers.Contract } | null>(null)

  const setUserData = (data: { wallet: string; displayName: string; role: string }) => {
    setWallet(data.wallet)
    setDisplayName(data.displayName)
    setRole(data.role)
  }

  const fetchTags = async (jobContract: ethers.Contract) => {
    try {
      const tags = []
      let index = 0

      while (true) {
        try {
          const tag = await jobContract.tags(index) // Fetch tag by index
          tags.push(tag)
          index++
        } catch (error) {
          // Break the loop when out-of-bounds error occurs
          break
        }
      }
      return tags
    } catch (error) {
      console.error("Error fetching tags:", error)
      return []
    }
  }

  // Setup contracts when provider or address changes
  useEffect(() => {
    const setupContracts = async () => {
      if (!provider || !address) {
        setContracts(null)
        return
      }

      const signer = await provider.getSigner()

      const jobFactory = new ethers.Contract(process.env.NEXT_PUBLIC_JOBFACTORY_ADDRESS || "", JOB_FACTORY_ABI, signer)

      const disputeDAOAddress = await fetchDisputeDAOAddress(jobFactory)

      const disputeDAO = new ethers.Contract(
        disputeDAOAddress || process.env.NEXT_PUBLIC_DAO_ADDRESS || "",
        DISPUTE_DAO_ABI,
        signer,
      )

      setContracts({ jobFactory, disputeDAO })
    }

    setupContracts()
  }, [provider, address])

  // Fetch all jobs when contracts are set up
  useEffect(() => {
    const fetchAllJobs = async () => {
      const activeProvider = provider || publicProvider // Use wallet provider if connected, otherwise public provider

      if (contracts?.jobFactory || publicProvider) {
        try {
          // Fetch job factory contract using the active provider
          const jobFactory =
            contracts?.jobFactory ||
            new ethers.Contract(
              process.env.NEXT_PUBLIC_JOBFACTORY_ADDRESS || "", 
              JOB_FACTORY_ABI, 
              activeProvider
            );

          // Fetch all job addresses
          const addresses = await fetchAllJobAddresses(jobFactory)

          setJobAddresses(addresses) // Store job addresses in state

          // Fetch job details
          const jobs = await Promise.all(
            addresses.map(async (address: string) => {
              const jobContract = new ethers.Contract(
                address, 
                PROOF_OF_WORK_JOB_ABI, 
                activeProvider
              );

              const [
                employer,
                title,
                description,
                payType,
                weeklyPay,
                totalPay,
                durationWeeks,
                createdAt,
                positions,
                jobCancelled,
              ] = await Promise.all([
                jobContract.employer(),
                jobContract.title(),
                jobContract.description(),
                jobContract.payType(),
                jobContract.weeklyPay(),
                jobContract.totalPay(),
                jobContract.durationWeeks(),
                jobContract.createdAt(),
                jobContract.positions(),
                jobContract.jobCancelled(), // Check if the job is canceled
              ]);

              // Skip canceled jobs
              if (jobCancelled) {
                return null
              }

              const tags = await fetchTags(jobContract)

              // Fetch assigned workers length
              const assignedWorkersLength = await fetchAssignedWorkersLength(jobContract)

              // Fetch reputation scores
              const reputationAddress = await jobContract.reputation() // Get the ReputationSystem contract address
              const reputationContract = new ethers.Contract(reputationAddress, REPUTATION_SYSTEM_ABI, provider)
              // Fetch reputation scores
              const ratingData = await getAverageRating(reputationContract, employer)
              const { averageRating, totalRatings } = ratingData || { averageRating: 0, totalRatings: 0 }

              const employerInfo = await fetchEmployerInfo(employer);

              return {
                address,
                employerAddress: employer,
                employer: employerInfo.displayName,
                title,
                description,
                payType: payType === BigInt(0) ? "WEEKLY" : "ONE_OFF",
                weeklyPay: ethers.formatEther(weeklyPay),
                totalPay: ethers.formatEther(totalPay),
                durationWeeks: durationWeeks.toString(),
                createdAt: new Date(Number(createdAt) * 1000).toLocaleDateString(),
                positions: positions.toString(),
                tags,
                positionsFilled: assignedWorkersLength,
                employerRating: averageRating,
                // messages
              }
            }),
          )

          // Filter out null values (canceled jobs)
          const filteredJobs = jobs.filter((job) => job !== null)

          setAllJobs(filteredJobs)
        } catch (error) {
          console.error("Error fetching all jobs:", error)
        }
      }
    }

    fetchAllJobs()
  }, [contracts?.jobFactory, provider, publicProvider])

  useEffect(() => {
    const activeProvider = provider || publicProvider

    if (contracts?.jobFactory || publicProvider) {
      try {
        // Fetch job factory contract using the active provider
        const jobFactory =
          contracts?.jobFactory ||
          new ethers.Contract(process.env.NEXT_PUBLIC_JOBFACTORY_ADDRESS || "", JOB_FACTORY_ABI, activeProvider)
        fetchJobsByEmployerFromEvents(jobFactory, wallet).then(setEmployerJobs)
      } catch (error) {
        console.error("Error fetching employer jobs:", error)
      }
    }
  }, [contracts?.jobFactory, provider, publicProvider, wallet])

  useEffect(() => {
    const activeProvider = provider || publicProvider
    if (employerJobs.length && activeProvider) {

      fetchJobDetails(employerJobs, activeProvider).then(setJobDetails)
    }
  }, [employerJobs, provider, address, publicProvider])

  useEffect(() => {
    const activeProvider = provider || publicProvider
    if (employerJobs.length && activeProvider) {
      fetchApplicantsForJobs(employerJobs, activeProvider).then(setApplicants)
    }
  }, [employerJobs, wallet, provider])

  const fetchAllDisputes = async (disputeDAOContract: ethers.Contract) => {
    try {
      if (!disputeDAOContract || !provider) {
        console.error("DisputeDAO contract or provider is not available.")
        return
      }
      // Fetch the total number of disputes
      const disputeCount = Number(await disputeDAOContract.getDisputeCount())

      // Fetch details for each dispute
      const disputes = await Promise.all(
        Array.from({ length: disputeCount }, async (_, id) => {
          // Destructure the tuple returned by getDisputeSummary
          const [job, initiator, resolved, votesFor, votesAgainst, reason] =
            await disputeDAOContract.getDisputeSummary(id)

          // Fetch the DisputeCreated event for this dispute
          const filter = disputeDAOContract.filters.DisputeCreated(id)
          const events = await disputeDAOContract.queryFilter(filter)

          let openedDate = "Unknown"
          let votingEnds = "Unknown"
          if (events.length > 0) {
            const block = await provider.getBlock(events[0].blockNumber)
            if (block) {
              openedDate = new Date(block.timestamp * 1000).toLocaleDateString()
              const votingEndsDate = new Date(block.timestamp * 1000)
              votingEndsDate.setDate(votingEndsDate.getDate() + 7) // Add 7 days
              votingEnds = votingEndsDate.toLocaleDateString()
            }
          }

          return { job, initiator, resolved, votesFor, votesAgainst, reason, openedDate, votingEnds }
        }),
      )

      // Fetch job details for each dispute
      const formattedDisputes = await Promise.all(
        disputes.map(async (dispute, id) => {
          const jobContract = new ethers.Contract(dispute.job, PROOF_OF_WORK_JOB_ABI, provider)

          // Fetch job title, employer, and assigned workers
          const [title, employer, description, assignedWorkers] = await Promise.all([
            jobContract.title(),
            jobContract.employer(),
            jobContract.description(),
            jobContract.getAssignedWorkers(),
          ])

          const workerAddress = assignedWorkers.length > 0 ? assignedWorkers[0] : null          

          // Fetch employer display name
          const [employerName, employerAvatar, workerName, workerAvatar]  = await Promise.all([                     
            fetchEmployerDisplayName(employer),
            fetchEmployerAvatar(employer),
            fetchEmployerDisplayName(workerAddress),
            fetchEmployerAvatar(workerAddress)
          ]);

          // Fetch messages for the dispute
            const messages = await axiosWithAuth(`${process.env.NEXT_PUBLIC_API}/messages/${id}`, {
              method: "GET",
            })
            .then(async (res) => {
              const resolvedMessages = await Promise.all(
                res.data.map(async (msg: any) => ({
                  sender: msg.sender,
                  senderName: await fetchEmployerDisplayName(msg.sender),
                  role:
                    msg.sender === employer.toLowerCase()
                      ? "employer"
                      : assignedWorkers.find((assigend: any) => msg.sender === assigend.toLowerCase())
                        ? "worker"
                        : "juror",
                  content: msg.content,
                  timestamp: new Date(msg.createdAt).toLocaleString(),
                })),
              )
              return resolvedMessages
            })
            .catch((error) => {
              console.error(`Error fetching messages for dispute ${id}:`, error)
              return []
            })

          // Add additional fields
          return {
            id,
            job: dispute.job,
            jobTitle: title,
            description,
            employer: {
              address: employer,
              name: employerName,
              avatar: employerAvatar,
            },
            worker: {
              address: workerAddress,
              name: workerName,
              avatar: workerAvatar
            },
            assignedWorkers: assignedWorkers,
            initiator: dispute.initiator,
            resolved: dispute.resolved,
            status: dispute.resolved ? "resolved" : "pending",
            resolution: dispute.resolved
              ? dispute.votesFor > dispute.votesAgainst
                ? "in_favor_of_worker"
                : "against_worker"
              : null,
            openedDate: dispute.openedDate, // Assuming `openedDate` is a timestamp
            votingEnds: dispute.votingEnds,
            votes: {
              for: dispute.votesFor.toString(),
              against: dispute.votesAgainst.toString(),
            },
            reason: dispute.reason,
            messages,
          }
        }),
      )

      setDisputes(formattedDisputes) // Store disputes in state

      // Filter disputes for the current user
      const filterDisputes = formattedDisputes.filter(
        (dispute) =>
          dispute.employer.address?.toLowerCase() === address?.toLowerCase() ||
          dispute.initiator?.toLowerCase() === address?.toLowerCase(),
      )
      setMyDisputes(filterDisputes)
      return formattedDisputes
    } catch (error) {
      console.error("Error fetching disputes:", error)
      return []
    }
  }

  const fetchMyJobs = async (jobAddresses: string[], userAddress: string) => {
    try {
      const jobs = [];

      for (const jobAddress of jobAddresses) {
        const jobContract = new ethers.Contract(jobAddress, PROOF_OF_WORK_JOB_ABI, provider)

        // Check if the user is an assigned worker
        const isWorker = await jobContract.isWorker(userAddress)
        if (isWorker) {
          // Fetch job details
          const [
            title,
            employer,
            payType,
            weeklyPay,
            totalPay,
            durationWeeks,
            createdAt,
            lastPayoutAt,
            payoutsMade,
            positionsFilled,
            disputeDAOAddress,
          ] = await Promise.all([
            jobContract.title(),
            jobContract.employer(),
            jobContract.payType(),
            jobContract.weeklyPay(),
            jobContract.totalPay(),
            jobContract.durationWeeks(),
            jobContract.createdAt(), // Fetch startDate (createdAt)
            jobContract.lastPayoutAt(), // Fetch lastPayoutAt
            jobContract.payoutsMade(),
            jobContract.getAssignedWorkers(),
            jobContract.disputeDAO(), // Fetch DisputeDAO address
          ])

          // Calculate progress percentage
          const progress = (Number(payoutsMade) / Number(durationWeeks)) * 100

          // Calculate nextPayoutDate (for WEEKLY payType)
          const nextPayoutDate =
            payType === BigInt(0) // WEEKLY
              ? new Date((Number(lastPayoutAt) + 7 * 24 * 60 * 60) * 1000).toLocaleDateString()
              : null

          // Map payType to string
          const payTypeString = payType === BigInt(0) ? "WEEKLY" : "ONE_OFF"

          // Fetch employer display name
          const employerName = await fetchEmployerDisplayName(employer)

          jobs.push({
            id: jobAddress,
            title,
            employer: employerName,
            payType: payTypeString,
            weeklyPay: ethers.formatEther(weeklyPay),
            totalPay: ethers.formatEther(totalPay),
            durationWeeks: durationWeeks.toString(),
            startDate: new Date(Number(createdAt) * 1000).toLocaleDateString(),
            progress: progress.toFixed(2),
            nextPayoutDate,
            payoutsMade: payoutsMade.toString(),
            positionsFilled: positionsFilled.length,
            disputeDAOAddress, // Include DisputeDAO address in the job object
          })
        }
      }

      return jobs
    } catch (error) {
      console.error("Error fetching my jobs:", error)
      return []
    }
  }

  useEffect(() => {
    const fetchJobsForUser = async () => {
      const activeProvider = provider || publicProvider
      if (contracts?.jobFactory && activeProvider && address) {
        try {
          // Fetch jobs where the user is a worker
          const jobs = await fetchMyJobs(jobAddresses, address)
          setMyJobs(jobs)
        } catch (error) {
          console.error("Error fetching jobs for user:", error)
        }
      }
    }

    fetchJobsForUser()
  }, [contracts?.jobFactory, provider, address, jobAddresses])

  useEffect(() => {
    const fetchDisputes = async () => {
      if (contracts?.disputeDAO) {
        try {
          await fetchAllDisputes(contracts.disputeDAO)
        } catch (error) {
          console.error("Error fetching disputes:", error)
        }
      }
    }

    fetchDisputes()
  }, [contracts?.disputeDAO])

  const sendP2PMessage = async (to: string, content: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/chat/messages`,
        { to, content },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } },
      )
    } catch (error) {
      console.error(`Error sending P2P message to ${to}:`, error)
    }
  }

  const fetchP2PMessages = async (peer: string, page = 1, limit = 50): Promise<any[]> => {
    try {
      const response = await axiosWithAuth(`${process.env.NEXT_PUBLIC_API}/chat/messages/${peer}`, {
        method: "GET",
        params: { page, limit },
      });
      return response.data
    } catch (error) {
      console.error(`Error fetching P2P messages with ${peer}:`, error)
      return []
    }
  }

  const fetchConversations = async (): Promise<any[]> => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
  
      const conversationMap = new Map<
        string,
        { otherPartyAddress: string; lastMessage: any; messages: any[] }
      >();
  
      for (const message of data) {
        const me = address?.toLowerCase();
        const sender   = message.sender.toLowerCase();
        const receiver = message.receiver.toLowerCase();
        const other    = sender === me ? receiver : sender;
  
        if (!conversationMap.has(other)) {
          conversationMap.set(other, {
            otherPartyAddress: other,
            lastMessage: message,
            messages: [],              // ← start empty
          });
        }
  
        const conv = conversationMap.get(other)!;
        conv.messages.push(message); // ← push every message
  
        // bump lastMessage if newer
        if (new Date(message.createdAt) > new Date(conv.lastMessage.createdAt)) {
          conv.lastMessage = message;
        }
      }
  
      // fetch names & sort as before…
      const withNames = await Promise.all(
        Array.from(conversationMap.values()).map(async (conv) => {
          let name: string;
          try {
            name = (await fetchEmployerDisplayName(conv.otherPartyAddress)) ||
              `${conv.otherPartyAddress.slice(0, 6)}…${conv.otherPartyAddress.slice(-4)}`;
          } catch {
            name = `${conv.otherPartyAddress.slice(0, 6)}…${conv.otherPartyAddress.slice(-4)}`;
          }
          return { ...conv, otherPartyName: name };
        })
      );
  
      withNames.sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
      );
  
      return withNames;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  };

  const sendMessage = async (disputeId: string, content: string) => {
    try {
      // Send the message to the backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/messages`,
        { disputeId, content },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        },
      )

      const newMessage = response.data // The saved message object returned by the backend

      // Transform the newMessage structure
      const employer = myDisputes.find((dispute) => dispute.id === Number(disputeId))?.employer.address || ""
      const assignedWorker = myDisputes.find((dispute) => dispute.id === Number(disputeId))?.worker.address || ""

      const transformedMessage = {
        sender: newMessage.sender,
        senderName: await fetchEmployerDisplayName(newMessage.sender),
        role:
          newMessage.sender === employer.toLowerCase()
          ? "employer"
            : newMessage.sender === assignedWorker.toLowerCase()
              ? "worker"
              : "juror",
        content: newMessage.content,
        timestamp: new Date(newMessage.createdAt).toLocaleString(),
      }

      // Update the messages in myDisputes
      setMyDisputes((prev) =>
        prev.map((dispute) =>
          dispute.id === Number(disputeId)
            ? {
                ...dispute,
                messages: [...(dispute.messages || []), transformedMessage], // Append the new message
              }
            : dispute,
        ),
      )

      setDisputes((prev) =>
        prev.map((dispute) =>
          dispute.id === Number(disputeId)
            ? {
                ...dispute,
                messages: [...(dispute.messages || []), transformedMessage], // Append the new message
              }
            : dispute,
        ),
      )

    } catch (error) {
      console.error(`Error sending message for dispute ${disputeId}:`, error)
    }
  }

  const submitApplication = async (
    jobAddress: string,
    applicationText: string,
  ) => {
    try {
      if(!provider) {
        console.error('Please connect the wallet first');
        return;
      }

      const signer = await provider.getSigner();
      // Step 1: Interact with the ProofOfWorkJob contract
      const jobContract = new ethers.Contract(jobAddress, PROOF_OF_WORK_JOB_ABI, signer);
  
      // Ensure the application text is valid
      if (!applicationText || applicationText.trim() === "") {
        throw new Error("Application text cannot be empty.");
      }
  
      // Submit the application
      const tx = await jobContract.submitApplication(applicationText);
      await tx.wait();
  
      // toast.success("Application submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting application:", error);
  
      throw new Error("Contract Error");
    }
  };  

  return (
    <UserContext.Provider
      value={{
        wallet,
        displayName,
        role,
        setUserData,
        contracts,
        provider,
        address,
        isConnected,
        allJobs,
        jobAddresses,
        setJobAddresses,
        myJobs,
        disputes,
        setDisputes,
        myDisputes,
        employerJobs,
        jobDetails,
        applicants,
        setApplicants,
        sendMessage,
        sendP2PMessage,
        fetchP2PMessages,
        setEmployerJobs,
        setJobDetails,
        setMyDisputes,
        fetchConversations,
        submitApplication
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}

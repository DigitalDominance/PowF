'use client'

import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Eip1193Provider, ethers } from "ethers";
import React, { createContext, useState, useContext, useMemo, useEffect } from "react";
import JOB_FACTORY_ABI from "../lib/contracts/JobFactory.json";
import DISPUTE_DAO_ABI from "../lib/contracts/DisputeDAO.json";
import REPUTATION_SYSTEM_ABI from '../lib/contracts/ReputationSystem.json';
import PROOF_OF_WORK_JOB_ABI from '../lib/contracts/ProofOfWorkJob.json';
import { io } from "socket.io-client";
import axios from "axios";

interface UserContextType {
  wallet: string;
  displayName: string;
  role: string;
  setUserData: (data: { wallet: string; displayName: string; role: string }) => void;
  contracts: { jobFactory: ethers.Contract; disputeDAO: ethers.Contract } | null;
  provider: BrowserProvider | null;
  address: string | undefined;
  isConnected: boolean;
  allJobs: any[]; // Add this
  jobAddresses: string[]; // Add this
  setJobAddresses: React.Dispatch<React.SetStateAction<string[]>>; // Add this
  myJobs: any[];
  disputes: any[];
  myDisputes: any[];
  sendMessage: (disputeId: string, content: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export const fetchEmployerInfo = async (wallet: string) => {
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
};

export const fetchEmployerDisplayName = async (employerAddress: string) => {
  try {
    const employerInfo = await fetchEmployerInfo(employerAddress);
    if (employerInfo) {
      return employerInfo.displayName;
    } else {
      console.error("Employer not found for address:", employerAddress);
      return "Unknown Employer";
    }
  } catch (error) {
    console.error("Error fetching employer display name:", error);
    return "Unknown Employer";
  }
};

export const getAverageRating = async (reputationContract: ethers.Contract, userAddress: string) => {
  try {
    const [average, totalRatings] = await reputationContract.getAverageRating(userAddress);
    console.log("Average Rating:", Number(average) / 100); // Divide by 100 for precision
    console.log("Total Ratings:", totalRatings);
    return { averageRating: Number(average) / 100, totalRatings };
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return null;
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [allJobs, setAllJobs] = useState<any[]>([]); // Add this
  const [jobAddresses, setJobAddresses] = useState<string[]>([]); // Add this
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [myDisputes, setMyDisputes] = useState<any[]>([]);

  // Wallet and contract state
  const { address, isConnected } = useAppKitAccount();

  const publicProvider = useMemo(() => {
    return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL); // Replace with your RPC URL
  }, []);
  const { walletProvider } = useAppKitProvider("eip155");
  const provider = useMemo(() => {
    if (!walletProvider) return null;
    return new BrowserProvider(walletProvider as Eip1193Provider);
  }, [walletProvider]);

  const [contracts, setContracts] = useState<{ jobFactory: ethers.Contract; disputeDAO: ethers.Contract } | null>(null);

  const setUserData = (data: { wallet: string; displayName: string; role: string }) => {
    setWallet(data.wallet);
    setDisplayName(data.displayName);
    setRole(data.role);
  };

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

  const fetchDisputeDAOAddress = async (jobFactoryContract: ethers.Contract) => {
    try {
      const disputeDAOAddress = await jobFactoryContract.disputeDAOAddress();
      console.log("Fetched DisputeDAO Address:", disputeDAOAddress);
      return disputeDAOAddress;
    } catch (error) {
      console.error("Error fetching DisputeDAO address:", error);
      return null;
    }
  };

  // Setup contracts when provider or address changes
  useEffect(() => {
    const setupContracts = async () => {
      if (!provider || !address) {
        setContracts(null);
        return;
      }

      const signer = await provider.getSigner();

      const jobFactory = new ethers.Contract(
        process.env.NEXT_PUBLIC_JOBFACTORY_ADDRESS || "",
        JOB_FACTORY_ABI,
        signer
      );

      const disputeDAOAddress = await fetchDisputeDAOAddress(jobFactory);

      const disputeDAO = new ethers.Contract(
        disputeDAOAddress || process.env.NEXT_PUBLIC_DAO_ADDRESS || "",
        DISPUTE_DAO_ABI,
        signer
      );

      setContracts({ jobFactory, disputeDAO });
    };

    setupContracts();
  }, [provider, address]);

  // Fetch all jobs when contracts are set up
  useEffect(() => {
    const fetchAllJobs = async () => {
      const activeProvider = provider || publicProvider; // Use wallet provider if connected, otherwise public provider

      if (contracts?.jobFactory || publicProvider) {
        try {
          // Fetch job factory contract using the active provider
          const jobFactory = contracts?.jobFactory || new ethers.Contract(
            process.env.NEXT_PUBLIC_JOBFACTORY_ADDRESS || "",
            JOB_FACTORY_ABI,
            activeProvider
          );

          // Fetch all job addresses
          const addresses = await fetchAllJobAddresses(jobFactory);
          setJobAddresses(addresses); // Store job addresses in state

          // Fetch job details
          const jobs = await Promise.all(
            addresses.map(async (address: string) => {
              const jobContract = new ethers.Contract(address, PROOF_OF_WORK_JOB_ABI, provider);

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

              const tags = await fetchTags(jobContract);

              // Fetch assigned workers length
              const assignedWorkersLength = await fetchAssignedWorkersLength(jobContract);

              // Fetch reputation scores
              const reputationAddress = await jobContract.reputation(); // Get the ReputationSystem contract address
              const reputationContract = new ethers.Contract(reputationAddress, REPUTATION_SYSTEM_ABI, provider);
              // Fetch reputation scores
              const ratingData = await getAverageRating(reputationContract, employer);
              const { averageRating, totalRatings } = ratingData || { averageRating: 0, totalRatings: 0 };

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
                employerRating: averageRating
              };
            })
          );

          setAllJobs(jobs);
        } catch (error) {
          console.error("Error fetching all jobs:", error);
        }
      }
    };

    fetchAllJobs();
  }, [contracts?.jobFactory, provider]);

  const fetchAllDisputes = async (disputeDAOContract: ethers.Contract) => {
    try {
      if (!disputeDAOContract || !provider) {
        console.error("DisputeDAO contract or provider is not available.");
        return;
      }
      // Fetch the total number of disputes
      const disputeCount = Number(await disputeDAOContract.getDisputeCount());
      console.log("Total Disputes:", disputeCount);

      // Fetch details for each dispute
      const disputes = await Promise.all(
        Array.from({ length: disputeCount }, async (_, id) => {
          // Destructure the tuple returned by getDisputeSummary
          const [job, initiator, resolved, votesFor, votesAgainst, reason] =
            await disputeDAOContract.getDisputeSummary(id);

          console.log("Dispute:", { job, initiator, resolved, votesFor, votesAgainst, reason });

          // Fetch the DisputeCreated event for this dispute
          const filter = disputeDAOContract.filters.DisputeCreated(id);
          const events = await disputeDAOContract.queryFilter(filter);

          let openedDate = "Unknown";
          let votingEnds = "Unknown";
          if (events.length > 0) {
            const block = await provider.getBlock(events[0].blockNumber);
            if (block) {
              openedDate = new Date(block.timestamp * 1000).toLocaleDateString();
              const votingEndsDate = new Date(block.timestamp * 1000);
              votingEndsDate.setDate(votingEndsDate.getDate() + 7); // Add 7 days
              votingEnds = votingEndsDate.toLocaleDateString();
            }
          }

          return { job, initiator, resolved, votesFor, votesAgainst, reason, openedDate, votingEnds };
        })
      );

      console.log('disputes', disputes)

      // Fetch job details for each dispute
      const formattedDisputes = await Promise.all(
        disputes.map(async (dispute, id) => {
          const jobContract = new ethers.Contract(dispute.job, PROOF_OF_WORK_JOB_ABI, provider);

          // Fetch job title, employer, and assigned workers
          const [title, employer, description, assignedWorkers] = await Promise.all([
            jobContract.title(),
            jobContract.employer(),
            jobContract.description(),
            jobContract.getAssignedWorkers(),
          ]);

          // Fetch employer display name
          const employerName = await fetchEmployerDisplayName(employer);

          // Fetch worker details (assuming the first worker is the one involved in the dispute)
          const workerAddress = assignedWorkers.length > 0 ? assignedWorkers[0] : null;
          const workerName = workerAddress ? await fetchEmployerDisplayName(workerAddress) : "Unknown Worker";

          // Fetch messages for the dispute
          const messages = await axios
            .get(`${process.env.NEXT_PUBLIC_API}/messages/${id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            })
            .then((res) =>
              res.data.map((msg: any) => ({
                sender: msg.sender,
                senderName: msg.sender === employer.toLowerCase() ? employerName : workerName,
                role: msg.sender === employer.toLowerCase() ? "employer" : "worker",
                content: msg.content,
                timestamp: new Date(msg.createdAt).toLocaleString(),
              }))
            )
            .catch((error) => {
              console.error(`Error fetching messages for dispute ${id}:`, error);
              return [];
            });

          // Add additional fields
          return {
            id,
            job: dispute.job,
            jobTitle: title,
            description, 
            employer: {
              address: employer,
              name: employerName,
            },
            worker: {
              address: workerAddress,
              name: workerName,
            },
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
            messages
          };
        })
      );

      console.log("Fetched Disputes:", formattedDisputes);
      setDisputes(formattedDisputes); // Store disputes in state

      // Filter disputes for the current user
      const filterDisputes = formattedDisputes.filter(
        (dispute) =>
          dispute.employer.address?.toLowerCase() === address?.toLowerCase() ||
          dispute.initiator?.toLowerCase() === address?.toLowerCase()
      );
      setMyDisputes(filterDisputes);
      return formattedDisputes;
    } catch (error) {
      console.error("Error fetching disputes:", error);
      return [];
    }
  };

  const fetchMyJobs = async (jobAddresses: string[], userAddress: string) => {
    try {
      const jobs = [];
      for (const jobAddress of jobAddresses) {
        const jobContract = new ethers.Contract(jobAddress, PROOF_OF_WORK_JOB_ABI, provider);

        // Check if the user is an assigned worker
        const isWorker = await jobContract.isWorker(userAddress);
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
          ] =
            await Promise.all([
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
            ]);

          // Calculate progress percentage
          const progress = (Number(payoutsMade) / Number(durationWeeks)) * 100;

          // Calculate nextPayoutDate (for WEEKLY payType)
          const nextPayoutDate =
            payType === BigInt(0) // WEEKLY
              ? new Date((Number(lastPayoutAt) + 7 * 24 * 60 * 60) * 1000).toLocaleDateString()
              : null;

          // Map payType to string
          const payTypeString = payType === BigInt(0) ? "WEEKLY" : "ONE_OFF";

          // Fetch employer display name
          const employerName = await fetchEmployerDisplayName(employer);

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
          });
        }
      }

      console.log("Fetched my jobs:", jobs);
      return jobs;
    } catch (error) {
      console.error("Error fetching my jobs:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchJobsForUser = async () => {
      if (contracts?.jobFactory && provider && address) {
        try {
          // Fetch jobs where the user is a worker
          const jobs = await fetchMyJobs(jobAddresses, address);
          setMyJobs(jobs);
        } catch (error) {
          console.error("Error fetching jobs for user:", error);
        }
      }
    };

    fetchJobsForUser();
  }, [contracts?.jobFactory, provider, address, jobAddresses]);

  useEffect(() => {
    const fetchDisputes = async () => {
      if (contracts?.disputeDAO) {
        try {
          await fetchAllDisputes(contracts.disputeDAO);
        } catch (error) {
          console.error("Error fetching disputes:", error);
        }
      }
    };

    fetchDisputes();
  }, [contracts?.disputeDAO]);

  // WebSocket setup for real-time chat
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API);

    socket.on("newMessage", (msg) => {
      const { disputeId, ...message } = msg;

      // Update messages in myDisputes
      setMyDisputes((prev) =>
        prev.map((dispute) =>
          dispute.id === disputeId
            ? { ...dispute, messages: [...(dispute.messages || []), message] }
            : dispute
        )
      );
    });

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, []);

  const sendMessage = async (disputeId: string, content: string) => {
    try {
      // Send the message to the backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/messages`,
        { disputeId, content },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );
  
      const newMessage = response.data; // The saved message object returned by the backend
  
      // Update the messages in myDisputes
      setMyDisputes((prev) =>
        prev.map((dispute) =>
          dispute.id === disputeId
            ? {
                ...dispute,
                messages: [...(dispute.messages || []), newMessage], // Append the new message
              }
            : dispute
        )
      );
  
      console.log(`Message sent for dispute ${disputeId}:`, newMessage);
    } catch (error) {
      console.error(`Error sending message for dispute ${disputeId}:`, error);
    }
  };  

  // Function to authenticate the wallet and get a new access token
  const authenticateWallet = async (wallet: string) => {
    try {
      // Request a challenge from the server
      const { data: challengeResponse } = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/auth/challenge`,
        { wallet }
      );

      const challenge = challengeResponse.challenge;

      // Sign the challenge with the wallet
      const signer = await provider?.getSigner();
      const signature = await signer?.signMessage(challenge);

      // Verify the signature and get the access token
      const { data: authResponse } = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/auth/verify`,
        { wallet, signature }
      );

      const newAccessToken = authResponse.accessToken;

      // Store the new access token in localStorage and state
      localStorage.setItem("accessToken", newAccessToken);

      console.log("Authenticated wallet:", wallet);
    } catch (error) {
      console.error("Error authenticating wallet:", error);
    }
  };

  // Detect wallet changes and reauthenticate
  useEffect(() => {
    if (address) {
      authenticateWallet(address);
    }
  }, [address]);  

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
        jobAddresses, // Provide jobAddresses
        setJobAddresses, // Provide setJobAddresses
        myJobs,
        disputes,
        myDisputes,
        sendMessage
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

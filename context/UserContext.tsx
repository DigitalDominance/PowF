'use client'

import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Eip1193Provider, ethers } from "ethers";
import React, { createContext, useState, useContext, useMemo, useEffect } from "react";
import JOB_FACTORY_ABI from "../lib/contracts/JobFactory.json";
import DISPUTE_DAO_ABI from "../lib/contracts/DisputeDAO.json";
import REPUTATION_SYSTEM_ABI from '../lib/contracts/ReputationSystem.json';
import PROOF_OF_WORK_JOB_ABI from '../lib/contracts/ProofOfWorkJob.json';
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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [allJobs, setAllJobs] = useState<any[]>([]); // Add this
  const [jobAddresses, setJobAddresses] = useState<string[]>([]); // Add this
  
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

      const disputeDAO = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAO_ADDRESS || "",
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
              const [workerScore, employerScore] = await reputationContract.getScores(employer);

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
                employerRating: employerScore
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
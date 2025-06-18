'use client'

import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Eip1193Provider, ethers } from "ethers";
import React, { createContext, useState, useContext, useMemo, useEffect } from "react";
import JOB_FACTORY_ABI from "../lib/contracts/JobFactory.json";
import DISPUTE_DAO_ABI from "../lib/contracts/DisputeDAO.json";

interface UserContextType {
  wallet: string;
  displayName: string;
  role: string;
  setUserData: (data: { wallet: string; displayName: string; role: string }) => void;
  contracts: { jobFactory: ethers.Contract; disputeDAO: ethers.Contract } | null;
  provider: BrowserProvider | null;
  address: string | undefined;
  isConnected: boolean;  
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");

  // Wallet and contract state
  const { address, isConnected } = useAppKitAccount();
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
      isConnected
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
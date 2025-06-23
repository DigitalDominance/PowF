"use client"

import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react"
import { useAccount, useEnsName, useBalance } from "wagmi"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Wallet, Copy, Check, ExternalLink, Briefcase, User } from "lucide-react"
// import { chains, kaspaEVMTestnet } from "@/lib/web3modal-config" // Import chains
import { useState, useEffect, useRef } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect } from "@reown/appkit/react"
import axios from 'axios'
import { useUserContext } from "@/context/UserContext"
// import { useContracts } from "@/hooks/useContract"

function truncateAddress(address: string) {
  if (!address) return "No Address"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWallet() {
  const { open, close } = useAppKit()
  const { disconnect } = useDisconnect();
  const { provider, address, isConnected, displayName, role } = useUserContext();
  const [isSigned, setIsSigned] = useState(false); // Track signing completion
  const [displayName_, setDisplayName_] = useState(""); // State for displayName
  const [challenge, setChallenge] = useState(""); // State for storing the challenge

  const [copied, setCopied] = useState(false)
  const [role_, setRole_] = useState(""); // State for role  

  const { setUserData } = useUserContext();  

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success("Address copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getBlockExplorerUrl = () => {
    if (address) {
      return `https://frontend.kasplextest.xyz/address/${address}`; // Example block explorer URL
    }    
    return "#"
  }

  const handleConnectWallet = async () => {
      console.log('connect')
      await open(); // Open WalletConnect modal
  }

  const renderRoleIcon = () => {
    if (role === "employer") {
      return (
        <span className="flex items-center gap-1 text-green-500">
          <Briefcase className="h-4 w-4"/> Employer
        </span>
      );
    } else if (role === "worker") {
      return (
        <span className="flex items-center gap-1 text-blue-500">
          <User className="h-4 w-4"/> Worker
        </span>
      );
    }
    return null; // No role assigned
  };  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.head(`${process.env.NEXT_PUBLIC_API}/users/${address}`);
        if (response.status === 200) {
          const response_ = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/${address}`)
          const data = response_.data;
          console.log('User data:', data);
          setUserData({ wallet: data.wallet, displayName: data.displayName, role: data.role });
          toast.success("User exists!");
        } else {
          toast.error("User not found!");
        }
      } catch (error) {
        try {
          toast.info("Authenticating user...");
          const { data: { challenge } } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/challenge`, { wallet: address });
          setChallenge(challenge); // Store the challenge

          setIsSigned(true);
        } catch (authError) {
          toast.error("Authentication failed!");
        }        
      }
    }

    if(isConnected && address && provider) {
      console.log('address', address, provider)
      fetchUser();
    }
  }, [address, isConnected, provider])

  const handleSubmitDisplayName = async () => {
    try {
      const signer = await provider?.getSigner();
      const { data: { accessToken, refreshToken } } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/verify`, {
        wallet: address,
        signature: await signer?.signMessage(challenge), // Use the signed challenge
        displayName: displayName_, // Pass the custom displayName
        role: role_
      });
  
      localStorage.setItem("accessToken", accessToken); // Save access token
      localStorage.setItem("refreshToken", refreshToken); // Save refresh token
      setUserData({ wallet: address || '', displayName: displayName_, role: role_ });

      toast.success("Authentication successful!");
      setIsSigned(false); // Reset signing state after submission
    } catch (error) {
      toast.error("Failed to submit display name!");
    }
  };  

  if (!isConnected || !address) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleConnectWallet} // Open WalletConnect modal
          variant="outline"
          className="font-varien border-accent text-accent hover:bg-accent/10 hover:text-accent group tracking-wider"
        >
          <Wallet className="mr-2 h-4 w-4 group-hover:animate-pulse-glow" />
          Connect Wallet
        </Button>
      </motion.div>
    );
  }

  const handleDisconnect = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUserData({ wallet: '', displayName: '', role: '' });
    disconnect();
    toast.success("Disconnected successfully!");
  };  

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("Refresh token not found");
  
      const { data: { accessToken } } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, { refreshToken });
      localStorage.setItem("accessToken", accessToken);
      return accessToken;
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      handleDisconnect();
    }
  };

  const handleReAuthentication = async () => {
    try {
      toast.info("Re-authenticating...");
      const { data: { challenge } } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/challenge`, { wallet: address });
      const signer = await provider?.getSigner();
      const { data: { accessToken, refreshToken } } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/verify`, {
        wallet: address,
        signature: await signer?.signMessage(challenge),
        displayName: displayName_, // Use the existing displayName
        role: role_,        // Use the existing role
      });
  
      // Store the new tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
  
      toast.success("Re-authentication successful!");
    } catch (error) {
      console.error("Re-authentication failed:", error);
      toast.error("Re-authentication failed. Please reconnect your wallet.");
      handleDisconnect(); // Disconnect the wallet if re-authentication fails
    }
  };  
  
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const { data: { accessToken } } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, { refreshToken });
            localStorage.setItem("accessToken", accessToken);
            error.config.headers["Authorization"] = `Bearer ${accessToken}`;
            return axios(error.config);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }
  
        // Only prompt for wallet signing if refresh fails
        try {
          await handleReAuthentication();
          return axios(error.config);
        } catch (authError) {
          console.error("Re-authentication failed:", authError);
          handleDisconnect(); // Disconnect if re-authentication fails
        }
      }
      return Promise.reject(error);
    }
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="font-varien flex items-center gap-2 border-accent/70 hover:border-accent">
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://effigy.im/a/${address}.svg`} alt={address} />
                <AvatarFallback>{address.charAt(2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span>{displayName || truncateAddress(address)}</span>
                {renderRoleIcon()}
              </div>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-varien w-64 glass-effect">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://effigy.im/a/${address}.svg`} alt={address} />
              <AvatarFallback>{address.charAt(2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{truncateAddress(address)}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyAddress}>
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={getBlockExplorerUrl()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {console.log('close'); disconnect();}} // Disconnect wallet
            className="text-red-500 hover:!text-red-500 focus:!text-red-500 hover:!bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Display Name Input */}
      {isSigned && (
      <div className="fixed inset-0 flex justify-center items-center bg-black/50 h-[100vh]">
        <div className="w-full max-w-md p-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Set Your Display Name and Role</h2>
          
          {/* Display Name Input */}
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName_}
            onChange={(e) => setDisplayName_(e.target.value)}
            placeholder="Enter your display name"
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent bg-gray-700 text-white sm:text-sm"
          />

          {/* Role Selection */}
          <label htmlFor="role" className="block text-sm font-medium text-gray-300 mt-4">
            Role
          </label>
          <select
            id="role"
            value={role_}
            onChange={(e) => setRole_(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent bg-gray-700 text-white sm:text-sm"
          >
            <option value="" disabled>Select your role</option>
            <option value="employer">Employer</option>
            <option value="worker">Employee</option>
          </select>

          {/* Submit Button */}
          <button
            onClick={handleSubmitDisplayName}
            className={`mt-4 px-4 py-2 rounded-md w-full ${
              displayName && role
                ? "bg-accent text-white hover:bg-accent-dark"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    )}
    </div>
  );  
}

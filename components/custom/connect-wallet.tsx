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
  const [isAuthenticating, setIsAuthenticating] = useState(false); // Prevent continuous authentication 
  const [isReAuthenticating, setIsReAuthenticating] = useState(false); // Prevent multiple re-authentication calls
  const [isSigningUp, setIsSigningUp] = useState(false); // Track signup state
  const isSigningUpRef = useRef(false); // Persistent reference for isSigningUp

  useEffect(() => {
    isSigningUpRef.current = isSigningUp; // Sync the ref with the state
  }, [isSigningUp]);  

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
        setIsAuthenticating(true); // Prevent redundant calls
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
          setIsSigningUp(true); // Mark as signing up
          setIsSigned(true);
        } catch (authError) {
          toast.error("Authentication failed!");
        }        
      } finally {
        setIsAuthenticating(false);
      }
    }

    if(isConnected && address && provider && !isAuthenticating) {
      console.log('address', address, provider)
      fetchUser();
    }
  }, [address, isConnected, provider])

  const handleSubmitDisplayName = async () => {
    console.log('Handle Submit Display Name')
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
      // setIsSigningUp(false); // Mark as signing up
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

  // const refreshAccessToken = async () => {
  //   try {
  //     const refreshToken = localStorage.getItem("refreshToken");
  //     if (!refreshToken) throw new Error("Refresh token not found");
  
  //     const { data: { accessToken } } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, { refreshToken });
  //     localStorage.setItem("accessToken", accessToken);
  //     return accessToken;
  //   } catch (error) {
  //     console.error("Failed to refresh access token:", error);
  //     handleDisconnect();
  //   }
  // };

  const handleReAuthentication = async () => {
    if (!isConnected || !address || isSigningUpRef.current) {
      console.log("Skipping re-authentication: Wallet not connected or user is signing up.");
      return;
    }

    try {
      console.log('Re-authenticating user', isConnected, address, isSigningUp, isSigned, isAuthenticating, isReAuthenticating);
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
  
  // let isReAuthenticating = false; // Track re-authentication state

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");

        // Skip re-authentication if the user is signing up
        if (!isConnected || !address || isSigningUp) {
          console.log("Skipping re-authentication during signup.");
          return Promise.reject(error);
        } 
  
        if (refreshToken && !isReAuthenticating) {
          // isReAuthenticating = true; // Prevent multiple re-authentication calls
          setIsReAuthenticating(true); // Prevent multiple re-authentication calls
  
          try {
            const { data: { accessToken } } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, { refreshToken });
            if (!accessToken) {
              throw new Error("Failed to refresh token");
            }

            localStorage.setItem("accessToken", accessToken);
            error.config.headers["Authorization"] = `Bearer ${accessToken}`;
            // isReAuthenticating = false; // Reset state after successful re-authentication
            setIsReAuthenticating(false); // Reset state after successful re-authentication
            return axios(error.config); // Retry the original request
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // isReAuthenticating = false; // Reset state even if refresh fails
            setIsReAuthenticating(false); // Reset state even if refresh fails
            handleDisconnect(); // Disconnect the wallet if refresh fails
            toast.error("Session expired. Please reconnect your wallet.");
          }
        }
  
        if (!isReAuthenticating) {
          try {
            await handleReAuthentication(); // Call re-authentication logic
            return axios(error.config); // Retry the original request
          } catch (authError) {
            console.error("Re-authentication failed:", authError);
            handleDisconnect(); // Disconnect if re-authentication fails
          }
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
              displayName_ && role_
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

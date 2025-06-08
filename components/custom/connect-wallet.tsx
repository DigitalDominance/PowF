"use client"

import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react"
import { useAccount, useDisconnect, useEnsName, useBalance } from "wagmi"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Wallet, Copy, Check, ExternalLink } from "lucide-react"
import { chains, kaspaEVMTestnet } from "@/lib/web3modal-config" // Import chains
import { useState, useEffect } from "react"
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

function truncateAddress(address: string) {
  if (!address) return "No Address"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWallet() {
  const { open } = useWeb3Modal()
  const { address, isConnected, chainId, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: balance } = useBalance({ address })
  const { selectedNetworkId } = useWeb3ModalState()

  const [copied, setCopied] = useState(false)
  const [currentChain, setCurrentChain] = useState<(typeof chains)[number] | undefined>(undefined)

  useEffect(() => {
    if (chainId) {
      setCurrentChain(chains.find((chain) => chain.id === chainId))
    } else if (selectedNetworkId) {
      setCurrentChain(chains.find((chain) => chain.id === Number.parseInt(selectedNetworkId)))
    } else {
      // Default to Kaspa EVM Testnet if no chain is selected or connected
      setCurrentChain(kaspaEVMTestnet)
    }
  }, [chainId, selectedNetworkId])

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success("Address copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getBlockExplorerUrl = () => {
    if (address && currentChain?.blockExplorers?.default.url) {
      return `${currentChain.blockExplorers.default.url}/address/${address}`
    }
    return "#"
  }

  if (!isConnected || !address) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => open()}
          variant="outline"
          className="border-accent text-accent hover:bg-accent/10 hover:text-accent group"
        >
          <Wallet className="mr-2 h-4 w-4 group-hover:animate-pulse-glow" />
          Connect Wallet
        </Button>
      </motion.div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" className="flex items-center gap-2 border-accent/70 hover:border-accent">
            <Avatar className="h-6 w-6">
              {/* You can use a library for blockies or jazzicons here based on address */}
              <AvatarImage src={`https://effigy.im/a/${address}.svg`} alt={address} />
              <AvatarFallback>{ensName ? ensName.charAt(0) : address.charAt(2)}</AvatarFallback>
            </Avatar>
            <span>{ensName || truncateAddress(address)}</span>
            {currentChain && (
              <img
                src={`https://token.metaswap.codefi.network/${currentChain.id}.png`}
                onError={(e) => (e.currentTarget.style.display = "none")}
                alt={currentChain.name}
                className="h-4 w-4 rounded-full"
              />
            )}
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 glass-effect">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://effigy.im/a/${address}.svg`} alt={address} />
            <AvatarFallback>{ensName ? ensName.charAt(0) : address.charAt(2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{ensName || truncateAddress(address)}</p>
            <p className="text-xs text-muted-foreground">{connector?.name}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {currentChain && (
          <DropdownMenuItem disabled className="flex justify-between">
            <span className="text-muted-foreground">Network</span>
            <span className="flex items-center gap-1">
              <img
                src={`https://token.metaswap.codefi.network/${currentChain.id}.png`}
                onError={(e) => (e.currentTarget.style.display = "none")}
                alt={currentChain.name}
                className="h-4 w-4 rounded-full"
              />
              {currentChain.name}
            </span>
          </DropdownMenuItem>
        )}
        {balance && (
          <DropdownMenuItem disabled className="flex justify-between">
            <span className="text-muted-foreground">Balance</span>
            <span>
              {Number.parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </span>
          </DropdownMenuItem>
        )}
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
        <DropdownMenuItem onClick={() => open({ view: "Networks" })}>
          <Wallet className="mr-2 h-4 w-4" />
          Switch Network
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="text-red-500 hover:!text-red-500 focus:!text-red-500 hover:!bg-red-500/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

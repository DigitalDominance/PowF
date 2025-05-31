import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

// Example USDT contract configuration
const USDTAddress = '0x617f3112bf5397D0467D315cC709EF968D9ba546';
const USDTAbi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint)',
  'function transfer(address to, uint amount)',
  'event Transfer(address indexed from, address indexed to, uint amount)'
];

export function ConnectButton() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');

  const getBalance = async () => {
    if (!isConnected) {
      console.error('User not connected');
      return;
    }

    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const USDTContract = new Contract(USDTAddress, USDTAbi, signer);
      const USDTBalance = await USDTContract.balanceOf(address);
      console.log('USDT Balance:', formatUnits(USDTBalance, 18));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button
        size="lg"
        className="bg-accent hover:bg-accent-hover text-accent-foreground shadow-lg hover:shadow-accent/40 transition-all duration-300 transform hover:scale-105 group"
        onClick={() => !isConnected && getBalance()}
      >
        <Wallet className="mr-2 h-5 w-5" />
        {isConnected ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
      </Button>
      {isConnected && (
        <Button
          size="lg"
          variant="outline"
          onClick={getBalance}
          className="shadow-lg hover:shadow-md transition-all duration-300 transform hover:scale-105 group border-accent/50 hover:bg-accent/10 hover:text-accent"
        >
          Check USDT Balance
        </Button>
      )}
    </div>
  );
} 
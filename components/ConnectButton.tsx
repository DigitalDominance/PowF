// components/ConnectButton.tsx

"use client";

import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ConnectButton() {
  const { address, isConnected } = useAppKitAccount();
  const appKit = useAppKit();
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      if (isConnected) {
        await appKit.close();
        toast({
          title: "Disconnected",
          description: "Wallet disconnected successfully",
        });
      } else {
        await appKit.open();
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <Button
      size="lg"
      onClick={handleClick}
      className="bg-accent hover:bg-accent-hover text-accent-foreground shadow-lg hover:shadow-accent/40 transition-all duration-300 transform hover:scale-105 group"
    >
      <Wallet className="mr-2 h-5 w-5" />
      {isConnected ? displayAddress : "Connect Wallet"}
    </Button>
  );
}

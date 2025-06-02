// lib/appkit.tsx

"use client";

import React, { useEffect } from "react";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { defineChain } from "@reown/appkit/networks";

// 1) Import AppKitNetwork for explicit typing
import type { AppKitNetwork } from "@reown/appkit/types";

// 2) Define Kaspa EVM Testnet as an AppKitNetwork via defineChain
const kaspaEVMTestnet = defineChain({
  id: 167012,
  caipNetworkId: "eip155:167012",
  chainNamespace: "eip155",
  name: "Kaspa EVM Testnet",
  network: "kaspa",
  nativeCurrency: { name: "Kaspa", symbol: "KAS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.kasplextest.xyz:167012"] },
    public:  { http: ["https://rpc.kasplextest.xyz:167012"] }
  },
  blockExplorers: {
    default: {
      name: "Kaspa Explorer",
      url: "https://frontend.kasplextest.xyz"
    }
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1
    }
  }
});

// 3) Explicitly type networks as a non‐empty tuple:
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [kaspaEVMTestnet];

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_PROJECT_ID environment variable is not set");
  }

  // 4) Optional metadata for your DApp
  const metadata = {
    name:        "Proof of Works",
    description: "Proof of Works – Decentralized Freelance Platform on Kaspa EVM",
    url:         "https://proofofworks.com",
    icons:       ["https://proofofworks.com/logo.png"]
  };

  // 5) Initialize AppKit on mount (client side)
  useEffect(() => {
    createAppKit({
      adapters:  [new EthersAdapter()],   // no constructor args
      networks,                           // now satisfies [AppKitNetwork, ...]
      projectId,
      metadata,
      features: {
        analytics: true
      }
    });
  }, [projectId]);

  return <>{children}</>;
}

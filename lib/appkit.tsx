// lib/appkit.tsx

"use client";

import React, { useEffect } from "react";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { defineChain } from "@reown/appkit/networks";

/**
 * 1) Define Kaspa EVM Testnet as an AppKitNetwork via defineChain.
 *    - `id`: 167012
 *    - `caipNetworkId`: "eip155:167012" (CAIP-2 format)
 *    - `chainNamespace`: "eip155"
 *    - `name`: "Kaspa EVM Testnet"
 *    - `network`: "kaspa"
 *    - `nativeCurrency`: { name: "Kaspa", symbol: "KAS", decimals: 18 }
 *    - `rpcUrls`: { default: { http: ["https://rpc.kasplextest.xyz:167012"] }, public: { http: ["https://rpc.kasplextest.xyz:167012"] } }
 *    - `blockExplorers`: { default: { name: "Kaspa Explorer", url: "https://frontend.kasplextest.xyz" } }
 *    - `testnet`: true
 *    - `contracts.multicall3`: { address: "0xcA11bde05977b3631167028862bE2a173976CA11", blockCreated: 1 }
 */
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

/**
 * 2) AppKitProvider component: initializes AppKit on the client.
 *    - Must run in a "use client" file so hooks work.
 *    - We inline `networks: [kaspaEVMTestnet]` directly to force TS to treat it as a non-empty tuple.
 */
export function AppKitProvider({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_PROJECT_ID environment variable is not set");
  }

  // Optional metadata for your DApp
  const metadata = {
    name:        "Proof of Works",
    description: "Proof of Works – Decentralized Freelance Platform on Kaspa EVM",
    url:         "https://proofofworks.com",
    icons:       ["https://proofofworks.com/logo.png"]
  };

  useEffect(() => {
    createAppKit({
      adapters:  [new EthersAdapter()],           // Ethers v6 adapter: no constructor args
      networks:  [kaspaEVMTestnet],               // Inlined array becomes a `[AppKitNetwork]` tuple
      projectId,
      metadata,
      features:  { analytics: true }              // Example feature flag
    });
  }, [projectId]);

  return <>{children}</>;
}

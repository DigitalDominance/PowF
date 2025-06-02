import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { defineChain } from 'viem';

// Kasplex Testnet configuration
const kaspaEVMTestnet = defineChain({
  id: 167012,
  name: 'Kaspa EVM Testnet',
  network: 'kaspa',
  nativeCurrency: { name: 'Kaspa', symbol: 'KAS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.kasplextest.xyz:167012'] },
    public: { http: ['https://rpc.kasplextest.xyz:167012'] }
  },
  blockExplorers: {
    default: {
      name: 'Kaspa Explorer',
      url: 'https://frontend.kasplextest.xyz',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1
    }
  }
});

// Project ID from Reown Cloud
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID environment variable is not set');
}

// Configure supported networks
const networks = [kaspaEVMTestnet];

// Metadata configuration
const metadata = {
  name: 'Proof of Works',
  description: 'Proof of Works - Decentralized Freelance Platform on Kaspa EVM',
  url: 'https://proofofworks.com',
  icons: ['https://proofofworks.com/logo.png']
};

// Initialize AppKit
export const initAppKit = () => {
  try {
    createAppKit({
      adapters: [new EthersAdapter()],
      networks,
      metadata,
      projectId,
      features: {
        analytics: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize AppKit:', error);
    throw error;
  }
}; 

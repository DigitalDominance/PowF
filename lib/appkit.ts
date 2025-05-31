import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';

// Kasplex Testnet configuration
const kaspaEVMTestnet = {
  id: 167012,
  name: 'Kaspa EVM Testnet',
  network: 'kaspa',
  nativeCurrency: { name: 'Kaspa', symbol: 'KAS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.kasplextest.xyz:167012'] },
  },
  blockExplorers: {
    default: {
      name: 'Kaspa Explorer',
      url: 'https://frontend.kasplextest.xyz',
    },
  },
  testnet: true,
};

// Project ID from Reown Cloud
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'f7cfd96fa6e20c1aa0ad95b2fa391c31';

// Configure supported networks
const networks = [kaspaEVMTestnet];

// Metadata configuration
const metadata = {
  name: 'Proof of Works',
  description: 'Proof of Works - Kaspa EVM Testnet',
  url: 'https://proofofworks.com',
  icons: ['https://proofofworks.com/logo.png']
};

// Initialize AppKit
export const initAppKit = () => {
  createAppKit({
    adapters: [new EthersAdapter()],
    networks,
    metadata,
    projectId,
    features: {
      analytics: true
    }
  });
}; 
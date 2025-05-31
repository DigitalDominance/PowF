"use client"

import { useEffect } from 'react';
import { initAppKit } from '@/lib/appkit';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      initAppKit();
    } catch (error) {
      console.error('Failed to initialize AppKit:', error);
    }
  }, []);

  return <>{children}</>;
} 
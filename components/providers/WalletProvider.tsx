"use client";

import React from "react";
import { AppKitProvider } from "@/lib/appkit";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <AppKitProvider>{children}</AppKitProvider>;
}

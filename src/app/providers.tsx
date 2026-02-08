"use client";

import * as React from 'react';
import {
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { NitroliteProvider } from '@/context/NitroliteContext';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NitroliteProvider>
          <RainbowKitProvider
            theme={darkTheme({
                accentColor: '#00f3ff', // Neon Blue
                accentColorForeground: 'white',
                borderRadius: 'medium',
                fontStack: 'system',
                overlayBlur: 'small',
            })}
            >
            {children}
          </RainbowKitProvider>
        </NitroliteProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

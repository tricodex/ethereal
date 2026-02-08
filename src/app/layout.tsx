import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { DailyRewardModal } from "@/components/game/DailyRewardModal";
import { YellowGameObserver } from "@/components/game/YellowGameObserver";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ethereal - Crypto Match-3",
  description: "Play Match-3, Wager USDC, Win Big.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
            <div className="min-h-screen flex flex-col items-center">
                <Header />
                <DailyRewardModal />
                <YellowGameObserver />
                {children}
            </div>
        </Providers>
      </body>
    </html>
  );
}

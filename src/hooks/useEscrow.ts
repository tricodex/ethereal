"use client";

import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { arcTestnet, ARC_CONTRACTS } from "@/lib/chains";

// Game Escrow ABI for staking/wagering USDC
const GAME_ESCROW_ABI = [
    {
        inputs: [{ name: "amount", type: "uint256" }],
        name: "deposit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "matchId", type: "bytes32" }, { name: "amount", type: "uint256" }],
        name: "lockFunds",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "matchId", type: "bytes32" }],
        name: "claimWinnings",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "user", type: "address" }],
        name: "getBalance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

// TODO: Deploy game escrow contract on Arc Testnet and set env var
const GAME_ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_GAME_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export function useEscrow() {
    const { address } = useAccount();
    const { writeContractAsync, isPending } = useWriteContract();

    // Read USDC balance on Arc
    const { data: usdcBalance } = useReadContract({
        address: ARC_CONTRACTS.USDC,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        chainId: arcTestnet.id,
    });

    // Read escrow balance
    const { data: escrowBalance } = useReadContract({
        address: GAME_ESCROW_ADDRESS,
        abi: GAME_ESCROW_ABI,
        functionName: "getBalance",
        args: address ? [address] : undefined,
        chainId: arcTestnet.id,
    });

    // Approve USDC spending
    const approveUsdc = async (amount: string) => {
        const hash = await writeContractAsync({
            address: ARC_CONTRACTS.USDC,
            abi: erc20Abi,
            functionName: "approve",
            args: [GAME_ESCROW_ADDRESS, parseUnits(amount, 6)],
            chainId: arcTestnet.id,
        });
        return hash;
    };

    // Deposit USDC to game escrow
    const deposit = async (amount: string) => {
        // First approve
        await approveUsdc(amount);

        // Then deposit
        const hash = await writeContractAsync({
            address: GAME_ESCROW_ADDRESS,
            abi: GAME_ESCROW_ABI,
            functionName: "deposit",
            args: [parseUnits(amount, 6)],
            chainId: arcTestnet.id,
        });
        return hash;
    };

    // Lock funds for a match/game
    const lockFunds = async (matchId: string, amount: string) => {
        // Generate bytes32 matchId from string
        const encoder = new TextEncoder();
        const data = encoder.encode(matchId);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const matchIdBytes = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const hash = await writeContractAsync({
            address: GAME_ESCROW_ADDRESS,
            abi: GAME_ESCROW_ABI,
            functionName: "lockFunds",
            args: [matchIdBytes as `0x${string}`, parseUnits(amount, 6)],
            chainId: arcTestnet.id,
        });
        return hash;
    };

    // Claim winnings after game completion
    const claimWinnings = async (matchId: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(matchId);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const matchIdBytes = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const hash = await writeContractAsync({
            address: GAME_ESCROW_ADDRESS,
            abi: GAME_ESCROW_ABI,
            functionName: "claimWinnings",
            args: [matchIdBytes as `0x${string}`],
            chainId: arcTestnet.id,
        });
        return hash;
    };

    return {
        deposit,
        lockFunds,
        claimWinnings,
        approveUsdc,
        isPending,
        usdcBalance: usdcBalance ? formatUnits(usdcBalance, 6) : "0",
        escrowBalance: escrowBalance ? formatUnits(escrowBalance, 6) : "0",
    };
}

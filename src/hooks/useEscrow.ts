"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { arc } from "@/lib/chains";

// Placeholder ABI - In real app, import from artifacts
const ESCROW_ABI = [
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
] as const;

const ESCROW_ADDRESS = "0xMockEscrowAddress"; // TODO: unique address

export function useEscrow() {
    const { writeContractAsync, isPending } = useWriteContract();

    const deposit = async (amount: string) => {
        const hash = await writeContractAsync({
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "deposit",
            args: [parseUnits(amount, 6)], // USDC 6 decimals
            chainId: arc.id, // Placeholder ID
        });
        return hash;
    };

    const lockFunds = async (matchId: string, amount: string) => {
        // Generate bytes32 matchId from string (mock)
        const matchIdBytes = "0x" + Buffer.from(matchId).toString("hex").padEnd(64, "0").slice(0, 64);

        const hash = await writeContractAsync({
            address: ESCROW_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "lockFunds",
            args: [matchIdBytes as `0x${string}`, parseUnits(amount, 6)],
            chainId: arc.id, // Placeholder ID
        });
        return hash;
    };

    return {
        deposit,
        lockFunds,
        isPending,
    };
}

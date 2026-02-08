// Yellow Network / Nitrolite State Channel Types

export interface ChannelState {
    channelId: string;
    version: number;
    status: 'pending' | 'active' | 'closing' | 'closed';
    balance: string; // User's USDC balance in channel (base units)
    lockedAmount: string; // Amount locked for current game
}

export interface GameSession {
    sessionId: string;
    channelId: string;
    stakeAmount: string;
    playerAddress: string;
    opponentAddress?: string; // For PvP
    startTime: number;
    status: 'active' | 'completed' | 'cancelled';
}

export interface StateUpdate {
    channelId: string;
    version: number;
    intent: 'INITIALIZE' | 'OPERATE' | 'RESIZE' | 'FINALIZE';
    data: string; // JSON stringified game state
    allocations: Allocation[];
}

export interface Allocation {
    participant: string;
    asset: string;
    amount: string;
}

export interface YellowConfig {
    clearNodeUrl: string;
    custodyContract: string;
    chainId: number;
}

// Game-specific state for off-chain operations
export interface OffChainGameState {
    score: number;
    moves: number;
    level: number;
    timestamp: number;
    signature?: string;
}

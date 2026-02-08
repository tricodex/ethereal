# CrushETH

**Onboarding Grandma to Web3 through hyper-casual gaming.**

CrushETH is a Match-3 game that demonstrates how complex blockchain infrastructure can be abstracted away from the user. It leverages **Yellow Network** for speed, **Arc & Circle** for liquidity, and **ENS** for identity.

## 🏆 Hackathon Tracks & API Usage

### 1. Yellow Network ($15,000 Prize)
**Goal**: "Integrate Yellow SDK to showcase instant, session-based transactions."

This project creates a "Speed Layer" where game moves happen off-chain via state channels, settling only when necessary.

*   **Real SDK Integration**: Uses `@erc7824/nitrolite` to connect to the **ClearNet Sandbox**.
*   **State Channels**: Every "Buy" action in the Yellow Market opens a cryptographically secure session.
*   **Off-Chain Settlement**: Moves are signed instanty without gas.
*   **On-Chain Finality**: The session result is settled to the `GameEscrow` contract on Arc.

**Code References:**
*   [`src/hooks/useNitrolite.ts`](src/hooks/useNitrolite.ts): Core hook handling WebSocket connection (`wss://clearnet-sandbox.yellow.com/ws`), session creation (`createAppSessionMessage`), and off-chain payments.
*   [`src/app/yellow-market/page.tsx`](src/app/yellow-market/page.tsx): UI implementation showing real-time latency and session status.
*   [`scripts/test-yellow-connectivity.ts`](scripts/test-yellow-connectivity.ts): Verification script proving connectivity to the Yellow Node.

---

### 2. Arc & Circle ($10,000 Prize)
**Goal**: "Treat multiple chains as one liquidity surface using Arc."

CrushETH treats Arc as the "Economic OS". Users from any chain (Arbitrum, Base, Sepolia) can play without manually bridging.

*   **Liquidity Hub**: The game treasury (`GameEscrow.sol`) lives on Arc L1.
*   **Circle Gateway**: Integrates the Cross-Chain Transfer Protocol (CCTP) to bridge USDC from user wallets (e.g. on Base) directly to the game's vault on Arc.
*   **Chain Abstraction**: The `GatewayDepositModal` detects the user's chain and routes liquidity automatically.

**Code References:**
*   [`src/hooks/useGateway.ts`](src/hooks/useGateway.ts): Implements `depositToGateway` and `transferToArc` using typed data signing (EIP-712) for CCTP burn intents.
*   [`src/components/web3/GatewayDepositModal.tsx`](src/components/web3/GatewayDepositModal.tsx): UI that manages the cross-chain flow.
*   [`contracts/GameEscrow.sol`](contracts/GameEscrow.sol): The solidity contract deployed on Arc Testnet (`0x0996c2e70E4Eb633A95258D2699Cb965368A3CB6`).

---

### 3. ENS ($5,000 Prize)
**Goal**: "Replace 0x addresses with human-readable names and social features."

Identity is critical for casual games. An address like `0x71...` is scary; `grandma.eth` is friendly.

*   **Primary Name Resolution**: Automatically resolves the connected wallet's ENS name in the Header and Sidebar.
*   **Avatar Integration**: Fetches and displays the ENS Avatar record (`text/avatar`) as the player's profile picture.
*   **Social Context**: Used in the "Duel" and "Leaderboard" systems (simulated) to show who you are playing against.

**Code References:**
*   [`src/components/layout/Header.tsx`](src/components/layout/Header.tsx): Implements `useEnsName` and `useEnsAvatar` for the main player profile.
*   [`src/components/layout/Sidebar.tsx`](src/components/layout/Sidebar.tsx): Persistent identity display.

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph User Session
        UI[Game UI]
        Y_SDK[Yellow/Nitrolite SDK]
        WAGMI[Wagmi/Viem Hooks]
        ENS[ENS Resolution]
    end

    subgraph Speed Layer
        Y_NODE[Yellow ClearNode Sandbox]
        Y_STATE[State Channel]
    end

    subgraph Economic Layer
        GATEWAY[Circle Gateway]
        ARC[Arc L1 Blockchain]
        ESCROW[GameEscrow.sol]
        USDC[USDC Contract]
    end

    subgraph External Liquidity
        ARB[Arbitrum]
        OP[Optimism]
        BASE[Base]
        SEP[Sepolia]
    end

    %% Flows from UI
    UI -->|Resolves| ENS
    UI -->|Connects| WAGMI
    UI <-->|Off-Chain Moves| Y_SDK

    %% Yellow Flow
    Y_SDK <-->|WebSocket| Y_NODE
    Y_NODE -->|Syncs| Y_STATE
    Y_SDK -->|Sign Close (Settlement)| WAGMI

    %% Arc Interactions
    WAGMI -->|Settle Balances| ESCROW
    ESCROW -.->|Contract| ARC
    ARC -->|Holds| USDC

    %% Gateway Flow
    ARB & OP & BASE & SEP -->|Deposit USDC| GATEWAY
    GATEWAY -->|Bridge/Mint| ARC
```

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    bun install
    ```

2.  **Run Development Server**:
    ```bash
    bun run dev
    ```

3.  **Verify Yellow Connection**:
    ```bash
    bun run scripts/test-yellow-connectivity.ts
    ```

4.  **Open in Browser**:
    Navigate to `http://localhost:3000`.

## 📦 Tech Stack

*   **Framework**: Next.js 14, React 18
*   **Language**: TypeScript
*   **Styling**: TailwindCSS, Framer Motion
*   **Web3**: Wagmi, Viem, RainbowKit
*   **Protocol SDKs**:
    *   `@erc7824/nitrolite` (Yellow)
    *   Circle CCTP (Arc)

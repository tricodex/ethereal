# Ethereal

**Onboarding Grandma to Web3 through hyper-casual gaming.**

Ethereal is a Match-3 game that demonstrates how complex blockchain infrastructure can be abstracted away from the user. It leverages **Yellow Network** for speed, **Arc & Circle** for liquidity, and **ENS** for identity.

## Hackathon Tracks & API Usage

### 1. Yellow Network
**Goal**: Integrate Yellow SDK for instant, session-based transactions.

*   **Requirement**: "Use the Yellow SDK / Nitrolite protocol"
    *   **Implementation**: Fully implemented using `@erc7824/nitrolite`.
        *   **Auth**: `createAuthRequestMessage` & `createAuthVerifyMessage`
        *   **Session**: `createAppSessionMessage`
        *   **State**: `createSubmitAppStateMessage` (v4)
        *   **Close**: `createCloseAppSessionMessage`
    *   See `src/hooks/useNitrolite.ts`.
*   **Requirement**: "Demonstrate off-chain transaction logic"
    *   **Implementation**: Every purchase triggers a state update signed by the user's session key.
*   **Requirement**: "Show on-chain settlement"
    *   **Implementation**: The session is finalized by calling `GameEscrow.settleSession` on **Base Sepolia** with the session signature. See `contracts/src/GameEscrow.sol`.

---

### 2. Base Sepolia (Settlement Layer)
**Goal**: Use Base Sepolia as the primary settlement layer for Yellow Network.

*   **Requirement**: "Show on-chain settlement"
    *   **Implementation**: All Yellow sessions settle to `GameEscrow.sol` on Base Sepolia.
*   **Requirement**: "Use Circle's Developer Tools"
    *   **Implementation**: Uses Circle's **Cross-Chain Transfer Protocol (CCTP)** to bridge funds to Base Sepolia if needed.

---

### 3. ENS

Identity is critical for casual games. An address like `0x71...` is intimidating; `grandma.eth` is accessible.

*   **Primary Name Resolution**: Automatically resolves the connected wallet's ENS name in the Header and Sidebar.
*   **Avatar Integration**: Fetches and displays the ENS Avatar record (`text/avatar`) as the player's profile picture.
*   **Social Context**: The Sidebar uses ENS resolution to show your identity. The Leaderboard page demonstrates how this identity layer would look in a global context.

**Code References:**
*   `src/components/layout/Header.tsx`: Implements `useEnsName` and `useEnsAvatar` for the main player profile.
*   `src/components/layout/Sidebar.tsx`: Persistent identity display.

---

## Architecture Declaration

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
        BASE[Base Sepolia]
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

    %% Base Interactions
    WAGMI -->|Settle Balances| ESCROW
    ESCROW -.->|Contract| BASE
    BASE -->|Holds| USDC

    %% Gateway Flow
    %% Gateway Flow
    ARB & OP & SEP -->|Deposit USDC| GATEWAY
    GATEWAY -->|Bridge/Mint| BASE
```

## Getting Started

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

## Tech Stack (Verified)

*   **Framework**: Next.js 16.1.6, React 19.2.3
*   **Language**: TypeScript 5.x
*   **Styling**: TailwindCSS 4, Framer Motion
*   **Web3**: Wagmi 3.4.2, Viem 2.45.1, RainbowKit
*   **Protocol SDKs**:
    *   `@erc7824/nitrolite` ^0.5.3 (Yellow)
    *   Circle CCTP (Arc)

# CrushETH

**Onboarding Grandma to Web3 through hyper-casual gaming.**

CrushETH is a Match-3 game that demonstrates how complex blockchain infrastructure can be abstracted away from the user. It leverages **Yellow Network** for speed, **Arc & Circle** for liquidity, and **ENS** for identity.

## Hackathon Tracks & API Usage

### 1. Yellow Network
**Goal**: Integrate Yellow SDK to showcase instant, session-based transactions.

This project creates a Speed Layer where game moves happen off-chain via state channels, settling only when necessary.

*   **SDK Integration**: Uses `@erc7824/nitrolite` to connect to the ClearNet Sandbox.
*   **State Channels**: Every Buy action in the Yellow Market opens a cryptographically secure session.
*   **Off-Chain Settlement**: Moves are signed instantly without gas.
*   **On-Chain Finality**: The session close is triggered on the `GameEscrow` contract on Arc, initiating the settlement flow.

**Code References:**
*   [`src/hooks/useNitrolite.ts:L22-55`](src/hooks/useNitrolite.ts#L22-55): **Connect Logic**. Establishes WebSocket connection to `wss://clearnet-sandbox.yellow.com/ws`.
*   [`src/hooks/useNitrolite.ts:L80-126`](src/hooks/useNitrolite.ts#L80-126): **Session Creation**. Implements `createAppSessionMessage` to open the state channel.
*   [`src/hooks/useNitrolite.ts:L128-158`](src/hooks/useNitrolite.ts#L128-158): **Off-Chain Payment**. Signs and sends `payment` messages instantly to the State Channel.
*   [`src/app/yellow-market/page.tsx:L39-76`](src/app/yellow-market/page.tsx#L39-76): **Settlement Trigger**. Signs the final balance and submits it to `GameEscrow.settleSession` on Arc.
*   [`contracts/src/GameEscrow.sol:L77-84`](contracts/src/GameEscrow.sol#L77-84): **On-Chain Settlement**. The `settleSession` function that finalizes the state on the blockchain.

---

### 2. Arc & Circle
**Goal**: Treat multiple chains as one liquidity surface using Arc.

CrushETH treats Arc as the Economic OS. Users from any chain (Arbitrum, Base, Sepolia) can play without manually bridging.

*   **Liquidity Hub**: The game treasury (`GameEscrow.sol`) lives on Arc L1.
*   **Circle Gateway**: Integrates the Cross-Chain Transfer Protocol (CCTP) to bridge USDC from user wallets directly to the game's vault on Arc.
*   **Chain Abstraction**: The `GatewayDepositModal` detects the user's chain and routes liquidity automatically.

**Code References:**
*   [`src/hooks/useGateway.ts:L182-234`](src/hooks/useGateway.ts#L182-234): **Deposit Logic**. `depositToGateway` function handling ERC20 approvals and Gateway deposits.
*   [`src/hooks/useGateway.ts:L237-350`](src/hooks/useGateway.ts#L237-350): **CCTP Bridge**. `transferToArc` function implementing EIP-712 signing for `BurnIntent` and minting on Arc via `GatewayMinter`.
*   [`src/components/web3/GatewayDepositModal.tsx`](src/components/web3/GatewayDepositModal.tsx): UI component that orchestrates the multi-chain chain switching and deposit flow.
*   [`contracts/src/GameEscrow.sol:L31-36`](contracts/src/GameEscrow.sol#L31-36): **Liquidity Hub**. The `deposit` function enabling the contract to hold game treasury funds on Arc.

---

### 3. ENS
**Goal**: Replace 0x addresses with human-readable names and social features.

Identity is critical for casual games. An address like `0x71...` is intimidating; `grandma.eth` is accessible.

*   **Primary Name Resolution**: Automatically resolves the connected wallet's ENS name in the Header and Sidebar.
*   **Avatar Integration**: Fetches and displays the ENS Avatar record (`text/avatar`) as the player's profile picture.
*   **Social Context**: The Sidebar uses ENS resolution to show your identity. The Leaderboard page demonstrates how this identity layer would look in a global context.

**Code References:**
*   [`src/components/web3/EnsProfile.tsx:L8-15`](src/components/web3/EnsProfile.tsx#L8-15): **Identity Resolution**. Uses `useEnsName` and `useEnsAvatar` to fetch Mainnet identity for the connected wallet.
*   [`src/components/layout/Header.tsx`](src/components/layout/Header.tsx): Displays the resolved avatar and name in the high-visibility player hud.

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
137: 
138: ## ⚠️ Hackathon Disclaimer
139: 
140: *   **Yellow Settlement**: The `GameEscrow` contract verifies that a signature *exists* and matches the session ID, but for this MVP, it trusts the sender's signature as the Yellow Node's authority. A production version would verify against a registered Node Public Key.
141: *   **Arc Bridge**: The CCTP integration uses the Testnet environment. Bridging times depend on Circle's Testnet attestation service.

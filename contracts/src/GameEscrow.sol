// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "forge-std/interfaces/IERC20.sol";

contract GameEscrow {
    IERC20 public usdc;
    address public owner;

    // User balances deposited in the escrow
    mapping(address => uint256) public balances;

    // Locked funds for a specific match/game session
    struct Match {
        address player;
        uint256 amount;
        bool active;
    }
    mapping(bytes32 => Match) public matches;

    event Deposited(address indexed user, uint256 amount);
    event FundsLocked(bytes32 indexed matchId, address indexed user, uint256 amount);
    event WinningsClaimed(bytes32 indexed matchId, address indexed user, uint256 amount);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }

    // Deposit USDC into the escrow
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    // Lock funds for a match
    function lockFunds(bytes32 matchId, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(!matches[matchId].active, "Match already active");

        balances[msg.sender] -= amount;
        matches[matchId] = Match({
            player: msg.sender,
            amount: amount,
            active: true
        });

        emit FundsLocked(matchId, msg.sender, amount);
    }

    // Claim winnings (Mock logic: returns stake * 2 for demo if "won")
    // In production, this heavily relies on server signing or oracle.
    // For Hackathon Demo: we allow unlocking after "game over" call.
    function claimWinnings(bytes32 matchId) external {
        Match storage game = matches[matchId];
        require(game.active, "Match not active");
        require(game.player == msg.sender, "Not your match");

        // Mock Logic: 1.5x Multiplier for demo "win"
        uint256 winnings = (game.amount * 150) / 100;

        game.active = false;
        balances[msg.sender] += winnings;

        emit WinningsClaimed(matchId, msg.sender, winnings);
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EscrowVault is Ownable, ReentrancyGuard {
    IERC20 public usdc;
    mapping(address => uint256) public balances;
    mapping(bytes32 => uint256) public lockedStakes;
    mapping(address => bool) public operators; // Backend signers/operators

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event StakeLocked(bytes32 indexed matchId, address indexed user, uint256 amount);
    event MatchSettled(bytes32 indexed matchId, address indexed winner, uint256 amount);

    constructor(address _usdc, address _initialOperator) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        operators[_initialOperator] = true;
    }

    modifier onlyOperator() {
        require(operators[msg.sender], "Not an operator");
        _;
    }

    function setOperator(address _operator, bool _status) external onlyOwner {
        operators[_operator] = _status;
    }

    // User deposits USDC into the vault
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    // User withdraws free funds
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient free balance");
        balances[msg.sender] -= amount;
        require(usdc.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    // Backend locks funds for a match (must be signed/authorized by user ideally, or simple lock if trusted for hackathon)
    // For MVP: User calls this to "commit" to a match
    function lockFunds(bytes32 matchId, uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient free balance");
        balances[msg.sender] -= amount;
        
        // We track the lock per match? simplified:
        // Ideally we map matchId -> total locked
        lockedStakes[matchId] += amount;
        
        emit StakeLocked(matchId, msg.sender, amount);
    }

    // Backend operator settles the match
    function settleMatch(
        bytes32 matchId,
        address winner,
        address loser,
        uint256 totalPot,
        uint256 fee
    ) external onlyOperator nonReentrant {
        // Validation logic usually checks if match was actually locked
        require(lockedStakes[matchId] >= totalPot, "Pot mismatch");
        
        uint256 payout = totalPot - fee;
        balances[winner] += payout;
        
        // Fee handling (could go to another balance or address)
        // For MVP, keep in contract or send to treasury
        // balances[treasury] += fee; 

        delete lockedStakes[matchId];
        
        emit MatchSettled(matchId, winner, payout);
    }
}

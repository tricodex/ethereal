// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Test, console} from "forge-std/Test.sol";
import {GameEscrow} from "../src/GameEscrow.sol";

contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {}

    function initialize(string memory _name, string memory _symbol, uint8 _decimals) external {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract GameEscrowTest is Test {
    GameEscrow public escrow;
    MockERC20 public usdc;
    address public user = address(1);
    address public opponent = address(2);

    function setUp() public {
        usdc = new MockERC20();
        usdc.initialize("USDC", "USDC", 18);
        escrow = new GameEscrow(address(usdc));

        // Mint USDC to user
        usdc.mint(user, 1000 * 10**18);
        vm.prank(user);
        usdc.approve(address(escrow), type(uint256).max);
    }

    function testDeposit() public {
        vm.prank(user);
        escrow.deposit(100 * 10**18);

        assertEq(escrow.getBalance(user), 100 * 10**18);
        assertEq(usdc.balanceOf(address(escrow)), 100 * 10**18);
    }

    function testLockFunds() public {
        vm.startPrank(user);
        escrow.deposit(100 * 10**18);
        
        bytes32 matchId = keccak256("match1");
        escrow.lockFunds(matchId, 50 * 10**18);
        
        assertEq(escrow.getBalance(user), 50 * 10**18); // 100 - 50
        vm.stopPrank();
    }

    function testClaimWinnings() public {
        vm.startPrank(user);
        escrow.deposit(100 * 10**18);
        
        bytes32 matchId = keccak256("match1");
        escrow.lockFunds(matchId, 50 * 10**18);
        
        // Claim
        escrow.claimWinnings(matchId);
        
        // 50 locked. Win 1.5x = 75. 
        // Initial 100. Locked 50 -> Remainder 50.
        // Win 75. Total 125.
        // Wait, logic says: balances[msg.sender] += winnings
        // winnings = (amount * 150) / 100 = 75.
        // Balance was 50. + 75 = 125. Correct.
        
        assertEq(escrow.getBalance(user), 125 * 10**18);
        vm.stopPrank();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {GameEscrow} from "../src/GameEscrow.sol";

contract LiveGameEscrowTest is Test {
    GameEscrow public escrow;
    address public deployedAddress = 0x0996c2e70E4Eb633A95258D2699Cb965368A3CB6;

    function setUp() public {
        // Forking is ideal, but here we just attach to the interface
        escrow = GameEscrow(deployedAddress);
    }

    function testOwner() public {
        address owner = escrow.owner();
        console.log("Contract Owner:", owner);
        // Verify it matches deployer
        // deployer was 0xb067fb16afcabf8a8974a35cbcee243b8fdf0ea1 (from logs)
        assertEq(owner, 0xb067fB16AFcABf8A8974a35CbCee243B8FDF0EA1);
    }

    // Attempt a 0 deposit to check revert message "Amount must be > 0"
    // This confirms we are hitting the right contract logic
    function testZeroDepositRevert() public {
        vm.expectRevert("Amount must be > 0");
        escrow.deposit(0);
    }
}

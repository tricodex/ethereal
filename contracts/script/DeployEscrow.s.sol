// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {GameEscrow} from "../src/GameEscrow.sol";

contract DeployEscrow is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Arc Testnet USDC Address
        address usdcAddress = 0x3600000000000000000000000000000000000000;

        vm.startBroadcast(deployerPrivateKey);

        GameEscrow escrow = new GameEscrow(usdcAddress);

        console.log("GameEscrow deployed at:", address(escrow));

        vm.stopBroadcast();
    }
}

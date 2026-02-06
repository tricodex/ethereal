// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlatformTreasury is Ownable {
    IERC20 public usdc;

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(usdc.transfer(to, amount), "Transfer failed");
    }
}

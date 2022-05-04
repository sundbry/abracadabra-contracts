// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "contracts/IBentoBoxV1.sol";
import "hardhat/console.sol";

contract MockBentobox is IBentoBoxV1 {

  using SafeMath for uint256;

  mapping(IERC20 => mapping(address => uint256)) public balanceOf;

  constructor() { }

  function withdraw(
      IERC20 token,
      address from,
      address to,
      uint256 amount,
      uint256 share
  ) public override returns (uint256, uint256) {
    uint256 value = amount;
    if (value == 0) {
      value = share;
    }
    console.log("BENTOBOX WITHDRAW", value, balanceOf[token][from]);
    balanceOf[token][from] = balanceOf[token][from].sub(value);
    token.transfer(to, value);
    return (value, value);
  }

  function deposit(
      IERC20 token,
      address from,
      address to,
      uint256 amount,
      uint256 share
  ) public override returns (uint256, uint256) {
    uint256 value = amount;
    if (value == 0) {
      value = share;
    }
    console.log("BENTOBOX DEPOSIT", value);
    token.transferFrom(from, address(this), value);
    balanceOf[token][to] = balanceOf[token][to].add(value);
    return (value, value);
  }

}

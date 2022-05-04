pragma solidity =0.6.12;

import "@sushiswap/core/contracts/uniswapv2/UniswapV2Factory.sol";

contract MockLpFactory is UniswapV2Factory {
  constructor(address _feeToSetter) UniswapV2Factory(_feeToSetter) public { }
}

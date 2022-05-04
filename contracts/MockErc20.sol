pragma solidity =0.6.12;

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@sushiswap/core/contracts/uniswapv2/UniswapV2ERC20.sol";

contract MockErc20 is UniswapV2ERC20 {
  constructor(string memory name_, string memory symbol_) UniswapV2ERC20() public { }

  function mint(address account, uint256 amount) public {
    _mint(account, amount);
  }
}

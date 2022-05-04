// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Pair.sol";
import "contracts/ISwapperGeneric.sol";
import "contracts/IBentoBoxV1.sol";

contract AvaxSwapper is ISwapperGeneric {
    IBentoBoxV1 public DEGENBOX;
    IUniswapV2Pair public MIMAVAX;
    IERC20 public MIM;
    IERC20 public WAVAX;

    constructor(IERC20 mim, IERC20 wavax, IUniswapV2Pair mimavaxLp, IBentoBoxV1 degenbox) {
        MIM = mim;
        DEGENBOX = degenbox;
        MIMAVAX = mimavaxLp;
        WAVAX = wavax;
        MIM.approve(address(DEGENBOX), type(uint256).max);
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function _getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256 amountOut) {
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;
    }

    // Swaps to a flexible amount, from an exact input amount
    /// @inheritdoc ISwapperGeneric
    function swap(
        IERC20,
        IERC20,
        address recipient,
        uint256 shareToMin,
        uint256 shareFrom
    ) public override returns (uint256 extraShare, uint256 shareReturned) {
        (uint256 avaxAmount, ) = DEGENBOX.withdraw(IERC20(address(WAVAX)), address(this), address(this), 0, shareFrom);
        // swap AVAX to MIM
        (uint256 reserve0, uint256 reserve1, ) = MIMAVAX.getReserves();
        uint256 mimFromAvax = _getAmountOut(avaxAmount, reserve1, reserve0);
        WAVAX.transfer(address(MIMAVAX), avaxAmount);
        MIMAVAX.swap(mimFromAvax, 0, address(this), new bytes(0));

        (, shareReturned) = DEGENBOX.deposit(MIM, address(this), recipient, mimFromAvax, 0);
        extraShare = shareReturned - shareToMin;
    }

    // Swaps to an exact amount, from a flexible input amount
    /// @inheritdoc ISwapperGeneric
    function swapExact(
        IERC20,
        IERC20,
        address,
        address,
        uint256,
        uint256
    ) public pure override returns (uint256 shareUsed, uint256 shareReturned) {
        return (0, 0);
    }
}

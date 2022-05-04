// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@sushiswap/core/contracts/uniswapv2/interfaces/IUniswapV2Pair.sol";
import "contracts/ISwapperGeneric.sol";
import "contracts/IBentoBoxV1.sol";

contract UsdceAvaxSwapper is ISwapperGeneric {
    IBentoBoxV1 public DEGENBOX;
    IUniswapV2Pair public USDCeAVAX;
    IUniswapV2Pair public MIMAVAX;
    IERC20 public MIM;
    IERC20 public WAVAX;
    IERC20 public USDCe;

    constructor(IERC20 mim, IERC20 usdce, IERC20 wavax, IUniswapV2Pair usdceavaxLp, IUniswapV2Pair mimavaxLp, IBentoBoxV1 degenbox) {
        MIM = mim;
        DEGENBOX = degenbox;
        USDCe = usdce;
        USDCeAVAX = usdceavaxLp;
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
        (uint256 amountFrom, ) = DEGENBOX.withdraw(IERC20(address(USDCeAVAX)), address(this), address(this), 0, shareFrom);

        USDCeAVAX.transfer(address(USDCeAVAX), amountFrom);
        (uint256 usdcAmount, uint256 avaxAmount) = USDCeAVAX.burn(address(this));
        
        // swap USDCe to AVAX
        (uint256 reserve0, uint256 reserve1, ) = USDCeAVAX.getReserves();
        uint256 avaxFromUsdc = _getAmountOut(usdcAmount, reserve0, reserve1);
        USDCe.transfer(address(USDCeAVAX), usdcAmount);
        USDCeAVAX.swap(0, avaxFromUsdc, address(this), new bytes(0));
        avaxAmount += avaxFromUsdc;

        // swap AVAX to MIM
        (reserve0, reserve1, ) = MIMAVAX.getReserves();
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

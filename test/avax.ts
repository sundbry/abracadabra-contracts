import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from 'ethers';
import { initAccount, hardhatReset } from './fixture';

describe("AvaxSwapper", function () {
  var recipient: any;
  var mim: any;
  var wavax: any;
  var mimavax: any;
  var swapper: any;
  var degenbox: any;

  before(async () => {
    await hardhatReset();
    recipient = await initAccount();
    const erc20Factory = await ethers.getContractFactory("MockErc20");

    mim = await erc20Factory.deploy("Magic Internet Money", "MIM");
    wavax = await erc20Factory.deploy("Wrapped AVAX", "WAVAX");

    const degenboxFactory = await ethers.getContractFactory("MockBentobox");
    degenbox = await degenboxFactory.deploy();

    const swapperFactory = await ethers.getContractFactory("AvaxSwapper");
    const lpFactoryFactory = await ethers.getContractFactory("MockLpFactory");
    const lpFactory = await lpFactoryFactory.deploy(recipient.address);
    const pairFactory = await ethers.getContractFactory("UniswapV2Pair");

    const mimavaxResult = await (await lpFactory.createPair(mim.address, wavax.address)).wait();
    const mimavaxAddress = mimavaxResult.events?.find((event: any) => event.event === 'PairCreated')?.args?.at(2);
    mimavax = pairFactory.attach(mimavaxAddress);
    swapper = await swapperFactory.deploy(mim.address, wavax.address, mimavax.address, degenbox.address);
    await swapper.deployed();


    // mint balances
    // fund mim lp
    await (await mim.mint(mimavax.address, BigNumber.from(1e6))).wait();
    await (await wavax.mint(mimavax.address, BigNumber.from(1e6))).wait();
    await (await mimavax.mint(recipient.address)).wait();
    // Fund wavax
    await (await wavax.mint(recipient.address, BigNumber.from(1e6))).wait();
    await (await wavax.approve(degenbox.address, BigNumber.from(1e12))).wait();
    const wavaxBalance = await wavax.balanceOf(recipient.address);
    // Fund degenbox
    await (await degenbox.deposit(wavax.address, recipient.address, swapper.address, wavaxBalance, 0)).wait();
  });

  it("Succeeds on swap", async function () {
    const balance0 = await degenbox.balanceOf(mim.address, recipient.address);
    expect(balance0).to.equal(BigNumber.from(0));
    await (await swapper.swap(wavax.address, mim.address, recipient.address, BigNumber.from(95), BigNumber.from(1e2))).wait();
    const balance1 = await degenbox.balanceOf(mim.address, recipient.address);
    expect(balance1).to.equal(BigNumber.from(99));
  });

  
});

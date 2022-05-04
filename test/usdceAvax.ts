import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from 'ethers';
import { initAccount, hardhatReset } from './fixture';

describe("UsdceAvaxSwapper", function () {
  var recipient: any;
  var mim: any;
  var usdce: any;
  var wavax: any;
  var usdceavax: any;
  var mimavax: any;
  var swapper: any;
  var degenbox: any;

  before(async () => {
    await hardhatReset();
    recipient = await initAccount();
    const erc20Factory = await ethers.getContractFactory("MockErc20");
    mim = await erc20Factory.deploy("Magic Internet Money", "MIM");
    usdce = await erc20Factory.deploy("USDC.e", "USDC.e");
    wavax = await erc20Factory.deploy("Wrapped AVAX", "WAVAX");

    const degenboxFactory = await ethers.getContractFactory("MockBentobox");
    degenbox = await degenboxFactory.deploy();

    const lpFactoryFactory = await ethers.getContractFactory("MockLpFactory");
    const lpFactory = await lpFactoryFactory.deploy(recipient.address);

    const usdceavaxTx = await lpFactory.createPair(usdce.address, wavax.address);
    const usdceavaxResult = await usdceavaxTx.wait();
    const usdceavaxAddress = usdceavaxResult.events?.find((event: any) => event.event === 'PairCreated')?.args?.at(2);
    const mimavaxTx = await lpFactory.createPair(mim.address, wavax.address);
    const mimavaxResult = await mimavaxTx.wait();
    const mimavaxAddress = mimavaxResult.events?.find((event: any) => event.event === 'PairCreated')?.args?.at(2);

    const pairFactory = await ethers.getContractFactory("UniswapV2Pair");
    usdceavax = pairFactory.attach(usdceavaxAddress);
    mimavax = pairFactory.attach(mimavaxAddress);

    const swapperFactory = await ethers.getContractFactory("UsdceAvaxSwapper");
    swapper = await swapperFactory.deploy(mim.address,
                                   usdce.address, 
                                   wavax.address, 
                                   usdceavax.address,
                                   mimavax.address,
                                   degenbox.address);
    await swapper.deployed();


    console.log("M1");
    // mint balances
    // fund mim lp
    await (await mim.mint(mimavax.address, BigNumber.from(1e6))).wait();
    await (await wavax.mint(mimavax.address, BigNumber.from(1e6))).wait();
    // fund usdce lp
    await (await usdce.mint(usdceavax.address, BigNumber.from(1e6))).wait();
    await (await wavax.mint(usdceavax.address, BigNumber.from(1e6))).wait();
    console.log("M2");
    // mint LP tokens
    await (await usdceavax.mint(recipient.address)).wait();
    await (await usdceavax.approve(degenbox.address, BigNumber.from(1e12))).wait();
    await (await mimavax.mint(recipient.address)).wait();
    const usdcavaxBalance = await usdceavax.balanceOf(recipient.address);
    console.log("M3");
    // Deposit LP tokens to the degenbox swapper account
    await (await degenbox.deposit(usdceavax.address, recipient.address, swapper.address, usdcavaxBalance, 0)).wait();
    console.log("M4");
  });

  it("Does not implement swapExact", async function () {
    expect(await swapper.swapExact(usdceavax.address, mim.address, recipient.address, recipient.address, BigNumber.from(100), BigNumber.from(100)))
    .to.deep.equal([BigNumber.from(0), BigNumber.from(0)]);
  });

  it("Succeeds on swap", async function () {
    const balance0 = await degenbox.balanceOf(mim.address, recipient.address);
    expect(balance0).to.equal(BigNumber.from(0));
    console.log("M5");
    const lpbalance = await usdceavax.balanceOf(degenbox.address);
    console.log("LP Balance", lpbalance);
    await (await swapper.swap(usdceavax.address, mim.address, recipient.address, BigNumber.from(190), BigNumber.from(1e2))).wait();
    const balance1 = await degenbox.balanceOf(mim.address, recipient.address);
    expect(balance1).to.equal(BigNumber.from(198));
    console.log("M6");
  });
  
});

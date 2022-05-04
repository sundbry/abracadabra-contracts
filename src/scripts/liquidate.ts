import { readFileSync } from "fs";
import { ethers } from "hardhat";
import { BigNumber, constants, ContractFactory, utils } from "ethers";
import { getGasLimit, getGasPrice, getWallet } from './common';

async function getMimBalance(bentobox: any, address: string) {
  const mimAddress = "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3";
  const balance = await bentobox.balanceOf(mimAddress, address);
  const divisor = BigNumber.from(10).pow(18);
  const dollarBalance = balance.div(divisor);
  return dollarBalance.toNumber();
}

async function liquidateAccount(
  victimAddress: string,
  cauldronAddress: string,
  swapperAddress: string,
  collateralAddress: string,
  bentoboxAddress: string
) {
  const overrides = {
    gasLimit: getGasLimit(),
    gasPrice: getGasPrice(),
  };
  const maxAmount = BigNumber.from("10000000000000000000000000");
  const wallet = await getWallet();
  const cauldronAbi = readFileSync("../resources/sspell-cauldron-abi.json");
  const cauldronInterface = new utils.Interface(cauldronAbi.toString());
  const cauldronFactory = new ContractFactory(cauldronInterface, "0x", wallet);
  const cauldron = cauldronFactory.attach(cauldronAddress);

  const bentoboxAbi = readFileSync("../resources/sushiswap-bentobox-abi.json");
  const bentoboxInterface = new utils.Interface(bentoboxAbi.toString());
  const bentoboxFactory = new ContractFactory(bentoboxInterface, "0x", wallet);
  const bentobox = bentoboxFactory.attach(bentoboxAddress);

  const mimBalance0 = await getMimBalance(bentobox, wallet.address);
  console.log("Starting MIM balance", mimBalance0);

  const liquidateTx = await cauldron.liquidate([victimAddress], [maxAmount], swapperAddress, swapperAddress, overrides);
  console.log("Liquidate transaction", liquidateTx);
  const liquidateTxResult = await liquidateTx.wait();
  console.log("Liquidate transaction complete", liquidateTxResult);
  const mimBalance1 = await getMimBalance(bentobox, wallet.address);
  console.log("Final MIM balance", mimBalance1);
}

async function main() {
  const cauldronAbi = readFileSync("../resources/sspell-cauldron-abi.json");
  const victimAddress = "0x26a8cb6c6f68543cba91038c532d88af214acd7c";

  /*
  // sSPELL
  const cauldronAddress = "0x3410297d89dcdaf4072b805efc1ef701bb3dd9bf";
  const swapperAddress = "0x125238B61064Ab2C00C3B22acB4B3B6E4732Ae90";
  const collateralAddress = "0x26fa3fffb6efe8c1e69103acb4044c26b9a106a9";
  const bentoboxAddress = "0xf5bce5077908a1b7370b9ae04adc565ebd643966";
  */

  // AVAX
  const cauldronAddress = "0x3cfed0439ab822530b1ffbd19536d897ef30d2a2";
  const swapperAddress = "0x0062E7b6018607e1a3648e94A09E1dd6f6b250F5";
  const collateralAddress = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
  const bentoboxAddress = "0xf4f46382c2be1603dc817551ff9a7b333ed1d18f";

  await liquidateAccount(victimAddress, cauldronAddress, swapperAddress, collateralAddress, bentoboxAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

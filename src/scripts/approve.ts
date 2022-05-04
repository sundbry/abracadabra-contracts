// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { readFileSync } from "fs";
import { ethers } from "ethers";
import { BigNumber, constants, ContractFactory, providers, utils, Wallet } from "ethers";
import { getGasLimit, getGasPrice, getWallet } from './common';

async function approveCauldronWithBentobox(cauldronAddress: string, bentoboxAddress: string) {
  const cauldronAbi = readFileSync("../resources/sspell-cauldron-abi.json");

  const overrides = {
    gasLimit: getGasLimit(),
    gasPrice: getGasPrice(),
  };
  const wallet = await getWallet();
  const cauldronInterface = new utils.Interface(cauldronAbi.toString());
  const cauldronFactory = new ContractFactory(cauldronInterface, "0x", wallet);
  const cauldron = cauldronFactory.attach(cauldronAddress);

  const bentoboxAbi = readFileSync("../resources/sushiswap-bentobox-abi.json");
  const bentoboxInterface = new utils.Interface(bentoboxAbi.toString());
  const bentoboxFactory = new ContractFactory(bentoboxInterface, "0x", wallet);
  const bentobox = bentoboxFactory.attach(bentoboxAddress);
  const cauldronMaster = await bentobox.masterContractOf(cauldron.address);
  const approveTx = await bentobox.setMasterContractApproval(wallet.address, cauldronMaster, true, 0, constants.HashZero, constants.HashZero, overrides);
  console.log("Approve transaction", approveTx);
  const approveTxResult = await approveTx.wait();
  console.log("Approve transaction complete", approveTxResult);
}

async function main() {
  /*
  // sSPELL cauldron
  const cauldronAddress = "0x3410297d89dcdaf4072b805efc1ef701bb3dd9bf";
  // sSPELL contract bentobox
  const bentoboxAddress = "0xf5bce5077908a1b7370b9ae04adc565ebd643966";
  */
  // AVAX cauldron
  const cauldronAddress = "0x3cfed0439ab822530b1ffbd19536d897ef30d2a2";
  // AVAX cauldron bentobox
  const bentoboxAddress = "0xf4f46382c2be1603dc817551ff9a7b333ed1d18f";

  await approveCauldronWithBentobox(cauldronAddress, bentoboxAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers, network } from "hardhat";

var initialized = false;

export async function initAccount() {
  // BUG?
  // We need to do some dummy transaction to get hardhat to initialize our account.
  if (!initialized) {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();
    initialized = true;
  }
  const accounts = (await ethers.getSigners());
  return accounts[0];
}

export async function hardhatReset() {
  await network.provider.request({
    method: "hardhat_reset",
    params: [],
  });
}

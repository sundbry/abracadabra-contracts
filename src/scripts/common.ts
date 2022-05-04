import { BigNumber, providers, Wallet } from "ethers";

function privateKey(): string {
  const key = process.env.PRIVATE_KEY;
  if (!key) {
    throw new Error("No PRIVATE_KEY");
  }
  return key;
}

function rpcUrl(): string {
  const url = process.env.RPC_URL;
  if (!url) {
    throw new Error("No RPC_URL");
  }
  return url;
}

function getNetwork(): providers.Network {
  // Avalanche
  return { 
    name: "Avalanche",
    chainId: 43114,
  };
}

export async function getWallet(): Promise<Wallet> {
  const provider = new providers.JsonRpcProvider(rpcUrl(), getNetwork());
  const wallet = new Wallet(privateKey(), provider);
  return wallet;
}

export function getGasLimit() {
  return BigNumber.from(6e5); // 1.8 ether @ 60gwei
}

export function getGasPrice() {
  // gwei
  //return BigNumber.from(60).mul(1e9);
  return undefined; // auto
  // return BigNumber.from(1);
}

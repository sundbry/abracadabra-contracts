// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const abracadabraBentobox = "0x1fC83f75499b7620d53757f0b01E2ae626aAE530";
  const mimAddress = "0x130966628846bfd36ff31a822705796e8cb8c18d";
  const wavaxAddress = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
  const usdceAddress = "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664";
  const mimAvaxJlpAddress = "0x781655d802670bba3c89aebaaea59d3182fd755d";
  const usdcewavaxAddress = "0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1";

  /*
  const avaxSwapperFactory = await ethers.getContractFactory("AvaxSwapper");
  const avaxSwapper = await avaxSwapperFactory.deploy(mimAddress, wavaxAddress, mimAvaxJlpAddress, abracadabraBentobox);
  await avaxSwapper.deployed();
  console.log("AvaxSwapper deployed to:", avaxSwapper.address);
  // Deployed to 0x0062E7b6018607e1a3648e94A09E1dd6f6b250F5
  */

  const usdceavaxSwapperFactory = await ethers.getContractFactory("UsdceAvaxSwapper");
  const usdceavaxSwapper = await usdceavaxSwapperFactory.deploy(mimAddress, usdceAddress, wavaxAddress, usdcewavaxAddress, mimAvaxJlpAddress, abracadabraBentobox);
  await usdceavaxSwapper.deployed();
  console.log("UsdceAvaxSwapper deployed to:", usdceavaxSwapper.address);
  // Deployed to 0xc7855F6EEb279FE0eE29F86E1430DcB71c643Ce4
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

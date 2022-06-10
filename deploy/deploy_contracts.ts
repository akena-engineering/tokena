import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers } = hre
  const { deploy, execute } = deployments
  const [deployer] = await ethers.getSigners()

  const Token = await deploy("RamboToken", {
    contract: "Token",
    from: deployer.address,
    args: ["RamboToken", "RMB"],
    log: true,
  })

  const Market = await deploy("Market", {
    from: deployer.address,
    args: [Token.address],
    log: true,
  })

  await execute(
    "RamboToken",
    { from: deployer.address },
    "setMarket",
    Market.address
  )
}

export default func

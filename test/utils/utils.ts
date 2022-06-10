import { ethers, deployments } from "hardhat"

import type { Contract } from "ethers"

export async function getContract<T extends Contract>(
  deploymentName: string
): Promise<T> {
  const deployment = await deployments.get(deploymentName)

  return (await ethers.getContractAt(deployment.abi, deployment.address)) as T
}

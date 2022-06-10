import { deployments, ethers } from "hardhat"
import { expect } from "chai"
import { getContract } from "./utils/utils"

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import type { Token } from "../typechain"

describe("Token", async () => {
  let token: Token

  let deployer: SignerWithAddress
  let market: SignerWithAddress
  let user: SignerWithAddress
  let thirdParty: SignerWithAddress

  const amount = ethers.BigNumber.from("1000")

  before(async () => {
    await deployments.fixture()

    token = await getContract("RamboToken")
    ;[deployer, market, user, thirdParty] = await ethers.getSigners()

    await token.connect(deployer).setMarket(market.address)
  })

  describe("setMarket", async () => {
    it("cannot be called by non-owner", async () => {
      await expect(
        token.connect(thirdParty).setMarket(market.address)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("mint", async () => {
    it("mints token for requested account", async () => {
      await expect(() =>
        token.connect(market).mint(user.address, amount)
      ).to.changeTokenBalance(token, user, amount)
    })

    it("cannot be called by non-market contract", async () => {
      await expect(
        token.connect(thirdParty).mint(user.address, amount)
      ).to.be.revertedWith("caller is not market contract")
    })
  })

  describe("burn", async () => {
    beforeEach(async () => {
      await token.connect(market).mint(user.address, amount)
      await token.connect(user).approve(market.address, amount)
    })

    it("burns token from requested account", async () => {
      await expect(() =>
        token.connect(market).burn(user.address, amount)
      ).to.changeTokenBalance(token, user, -amount)
    })

    it("cannot be called by non-market contract", async () => {
      await expect(
        token.connect(thirdParty).burn(user.address, amount)
      ).to.be.revertedWith("caller is not market contract")
    })
  })
})

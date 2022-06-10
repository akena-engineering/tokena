import { deployments, ethers } from "hardhat"
import { expect } from "chai"
import { getContract } from "./utils/utils"

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import type { Token, Market } from "../typechain"

describe("Market", async () => {
  let token: Token
  let market: Market

  let user: SignerWithAddress
  let beneficiary: SignerWithAddress

  const amount = ethers.BigNumber.from("1000")

  beforeEach(async () => {
    await deployments.fixture()

    token = await getContract("RamboToken")
    market = await getContract("Market")
    ;[, user, beneficiary] = await ethers.getSigners()
  })

  describe("buy", async () => {
    it("rejects transaction with value less than minimum", async () => {
      const minimumAmount = await market.minimumAmount()

      const requestValue = minimumAmount.sub(1)

      await expect(market.buy({ value: requestValue })).to.be.revertedWith(
        "transaction value is less than minimum amount"
      )
    })

    it("mints token", async () => {
      await expect(() =>
        market.connect(user).buy({ value: amount })
      ).to.changeTokenBalance(token, user, amount)
    })

    it("emits event", async () => {
      const tx = await market.connect(user).buy({ value: amount })

      await expect(tx)
        .to.emit(market, "TokenBought")
        .withArgs(user.address, amount)
    })
  })

  describe("sell", async () => {
    beforeEach(async () => {
      await market.connect(user).buy({ value: amount })
      await token.connect(user).approve(market.address, amount)
    })

    it("errors when user has insufficient token balance", async () => {
      const tokenBalance = await token.balanceOf(user.address)
      const requestedAmount = tokenBalance.add(1)

      await expect(
        market.sell(requestedAmount, beneficiary.address)
      ).to.be.revertedWith("insufficient token balance")
    })

    it("burns token", async () => {
      await expect(() =>
        market.connect(user).sell(amount, beneficiary.address)
      ).to.changeTokenBalance(token, user, -amount)
    })

    it("transfers ether to seller", async () => {
      await expect(() =>
        market.connect(user).sell(amount, beneficiary.address)
      ).to.changeEtherBalance(beneficiary, amount)
    })

    it("emits event", async () => {
      const tx = await market.connect(user).sell(amount, beneficiary.address)

      await expect(tx)
        .to.emit(market, "TokenSold")
        .withArgs(user.address, beneficiary.address, amount)
    })
  })
})

const Token = artifacts.require('Token')
const Market = artifacts.require('Market')

const truffleAssert = require('truffle-assertions')

const BN = require('bn.js');
const bnChai = require('bn-chai');
const chai = require('chai');

chai.use(bnChai(BN));
const expect = chai.expect

contract("Token", async accounts => {
    let token
    let market

    const userAddress = accounts[1]
    const amount = new BN('1000')

    describe("buy", async () => {
        before(async () => {
            token = await Token.new()
            market = await Market.new(token.address)

            token.setMarket(market.address)
        })

        it("rejects transaction with value less than minimum", async () => {
            const minimumAmount = await market.minimumAmount()

            const requestValue = minimumAmount.sub(new BN(1))

            try {
                await market.buy({ value: requestValue })
                assert(false, 'test did not error as expected')
            } catch (e) {
                assert.include(e.message, 'transaction value is less than minimum amount')
            }
        })

        it("mints token", async () => {
            const startBalance = await token.balanceOf.call(userAddress)

            await market.buy({ from: userAddress, value: amount })

            const endBalance = await token.balanceOf.call(userAddress)

            expect(endBalance).to.eq.BN(startBalance.add(amount))
        })

        it("emits event", async () => {
            const tx = await market.buy({ from: userAddress, value: amount })

            truffleAssert.eventEmitted(tx, 'TokenBought', (ev) => {
                return ev.buyer === userAddress && ev.amount.eq(amount)
            })
        })
    })

    describe("sell", async () => {
        const beneficiary = accounts[2]

        before(async () => {
            token = await Token.new()
            market = await Market.new(token.address)

            token.setMarket(market.address)
        })

        beforeEach(async () => {
            await market.buy({ from: userAddress, value: amount })

            await token.approve(market.address, amount, { from: userAddress })
        })

        it("errors when user has insufficient token balance", async () => {
            const tokenBalance = await token.balanceOf.call(userAddress)
            const requestedAmount = tokenBalance.add(new BN(1))

            try {
                await market.sell(requestedAmount, beneficiary, { from: userAddress })
                assert(false, 'test did not error as expected')
            } catch (e) {
                assert.include(e.message, 'insufficient token balance')
            }
        })

        it("burns token", async () => {
            const startBalance = await token.balanceOf.call(userAddress)

            await market.sell(amount, beneficiary, { from: userAddress })

            const endBalance = await token.balanceOf.call(userAddress)

            expect(endBalance).to.eq.BN(startBalance.sub(amount))
        })

        it("transfers ether to seller", async () => {
            const startBalance = await web3.eth.getBalance(beneficiary)

            await market.sell(amount, beneficiary, { from: userAddress })

            const endBalance = await web3.eth.getBalance(beneficiary)

            expect(endBalance).to.eq.BN(new BN(startBalance).add(new BN(amount)))
        })

        it("emits event", async () => {
            const tx = await market.sell(amount, beneficiary, { from: userAddress })

            truffleAssert.eventEmitted(tx, 'TokenSold', (ev) => {
                return ev.seller === userAddress && ev.amount.eq(amount) && ev.beneficiary == beneficiary
            })
        })
    })
})

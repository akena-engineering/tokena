const Token = artifacts.require('Token')

const BN = require('bn.js');
const bnChai = require('bn-chai');
const chai = require('chai');

chai.use(bnChai(BN));
const expect = chai.expect

contract("Token", async accounts => {
    let token
    const marketAddress = accounts[1]
    const userAddress = accounts[2]
    const amount = new BN('1000')

    describe("setMarket", async () => {
        before(async () => {
            token = await Token.new()
        })

        it("cannot be called by non-owner", async () => {
            try {
                await token.setMarket(marketAddress, { from: accounts[3] })
                assert(false, 'test did not error as expected')
            } catch (e) {
                assert.include(e.message, 'Ownable: caller is not the owner')
            }
        })
    })

    describe("mint", async () => {
        before(async () => {
            token = await Token.new()
            token.setMarket(marketAddress)
        })

        it("mints token for requested account", async () => {
            const startBalance = await token.balanceOf.call(userAddress)

            await token.mint(userAddress, amount, { from: marketAddress })

            const endBalance = await token.balanceOf.call(userAddress)

            expect(endBalance).to.eq.BN(startBalance.add(amount))
        })

        it("cannot be called by non-market contract", async () => {
            try {
                await token.mint(userAddress, amount, { from: accounts[3] })
                assert(false, 'test did not error as expected')
            } catch (e) {
                assert.include(e.message, 'caller is not market contract')
            }
        })
    })

    describe("burnFrom", async () => {
        before(async () => {
            token = await Token.new()
            token.setMarket(marketAddress)
        })

        beforeEach(async () => {
            await token.mint(userAddress, amount, { from: marketAddress })
            await token.approve(marketAddress, amount, { from: userAddress })
        })

        it("burns token from requested account", async () => {
            const startBalance = await token.balanceOf.call(userAddress)

            await token.burnFrom(userAddress, amount, { from: marketAddress })

            const endBalance = await token.balanceOf.call(userAddress)

            expect(endBalance).to.eq.BN(startBalance.sub(amount))
        })

        it("cannot be called by non-market contract", async () => {
            try {
                await token.burnFrom(userAddress, amount, { from: accounts[3] })
                assert(false, 'test did not error as expected')
            } catch (e) {
                assert.include(e.message, 'caller is not market contract')
            }
        })
    })
})

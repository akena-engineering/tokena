const Token = artifacts.require('Token')
const Market = artifacts.require('Market')

module.exports = (deployer) => {
  deployer.then(async () => {
    const token = await deployer.deploy(Token)

    await deployer.deploy(Market, Token.address)

    await token.setMarket(Market.address)
  })
}

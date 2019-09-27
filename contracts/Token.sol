pragma solidity ^0.5.11;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Token is ERC20, Ownable {
    address market;

    function setMarket(address _market) external onlyOwner {
        market = _market;
    }

    /// @dev             Mints an amount of the token and assigns it to an account.
    ///                  Uses the internal _mint function
    /// @param _account  The account that will receive the created tokens.
    /// @param _amount   The amount of tokens that will be created.
    function mint(address _account, uint256 _amount) public onlyMarket returns (bool){
        _mint(_account, _amount);
        return true;
    }

    /// @dev             Burns an amount of the token of a given account
    ///                  deducting from the sender's allowance for said account.
    ///                  Uses the internal _burn function.
    /// @param _account  The account whose tokens will be burnt.
    /// @param _amount   The amount of tokens that will be burnt.
    function burnFrom(address _account, uint256 _amount) public onlyMarket {
        _burnFrom(_account, _amount);
    }

    modifier onlyMarket(){
        require(msg.sender == market, "caller is not market contract");
        _;
    }
}

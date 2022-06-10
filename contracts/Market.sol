// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

contract Market {
    uint256 public minimumAmount = 100;

    address token;

    event TokenBought(address indexed buyer, uint256 amount);
    event TokenSold(
        address indexed seller,
        address indexed beneficiary,
        uint256 amount
    );

    constructor(address _token) {
        token = _token;
    }

    /// @notice Buy token amount equal to ether value transferred in the transaction.
    /// @dev Requires value of the transaction to be at least the minimum amount.
    ///      Mints token and emits an event.
    function buy() external payable {
        require(
            msg.value >= minimumAmount,
            "transaction value is less than minimum amount"
        );

        Token(token).mint(msg.sender, msg.value);

        emit TokenBought(msg.sender, msg.value);
    }

    /// @notice Sell specific number of tokens and transfer ether to specific account.
    /// @param _amount Amount of tokens to sell.
    /// @param _beneficiary Account to which ether should be transferred.
    function sell(uint256 _amount, address payable _beneficiary) external {
        require(
            Token(token).balanceOf(msg.sender) >= _amount,
            "insufficient token balance"
        );

        Token(token).burn(msg.sender, _amount);

        _beneficiary.transfer(_amount);

        emit TokenSold(msg.sender, _beneficiary, _amount);
    }
}

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract TokenAllowance is Ownable {
    mapping(address => bool) public allowedTokens;

    modifier checkTokenSupport(address tokenAddress) {
        require(allowedTokens[tokenAddress], "This token is not supported yet");
        _;
    }

    function allowToken(address tokenAddress) public onlyOwner {
        if (!allowedTokens[tokenAddress]) {
            updateToken(tokenAddress, true);
        }
    }

    function disallowToken(address tokenAddress) public onlyOwner {
        if (allowedTokens[tokenAddress]) {
            updateToken(tokenAddress, false);   
        }
    }

    function updateToken(address tokenAddress, bool allowance) private {
        allowedTokens[tokenAddress] = allowance;
    }
}
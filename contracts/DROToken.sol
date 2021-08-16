pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DROCoinContract is ERC20 {
    constructor() ERC20('DrozdCoin', 'DRO') {
        _mint(msg.sender, 10**22);
    }   
}
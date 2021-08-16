pragma solidity ^0.8.0;

interface IDROTokenTrust {
    function getEtherBalance() external view returns (uint256);
    function getTokenBalance(address tokenAddress) external view returns (uint256);

    function depositEth() payable external;
    function withdrawEth(uint256 amount) external returns (bool);
    
    function depositToken(address tokenAddress, uint amount) external returns (bool);
    function withdrawToken(address tokenAddress, uint256 amount) external returns (bool);

    event Deposit(address indexed from, address indexed tokenAddress, uint amount);
    event Transfer(address indexed from, address indexed to, uint amount);
}
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./IDROTokenTrust.sol";
import "./TokenAllowance.sol";

contract DROTokenTrust is IDROTokenTrust, TokenAllowance {
    using SafeMath for uint;

    mapping(address => mapping(address => uint)) private _balances;

    constructor() {}

    function _transfer(address tokenAddress, address to, uint amount) private returns (bool) {
        uint256 senderBalance = _balances[msg.sender][tokenAddress];
        require(senderBalance >= amount, "Not enough tokens to withdraw");

        bool transferResult;
        if (tokenAddress == address(0)) {
            transferResult = payable(msg.sender).send(amount);
        } else {
            transferResult = IERC20(tokenAddress).transfer(to, amount);
        }

        require(transferResult, "Transfer failed");
        _balances[msg.sender][tokenAddress] = _balances[msg.sender][tokenAddress].sub(amount);

        emit Transfer(address(this), msg.sender, amount);

        return true;
    }

    function getEtherBalance() public view override returns (uint) {
        return _balances[msg.sender][address(0)];
    }

    function getTokenBalance(address tokenAddress) public view override returns (uint) {
        return _balances[msg.sender][tokenAddress];
    }

    function depositToken(address tokenAddress, uint amount) external override checkTokenSupport(tokenAddress) returns (bool) {
        bool transferResult = IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);

        require(transferResult, "Deposit failed");
        
        emit Deposit(msg.sender, tokenAddress, amount);
        
        _balances[msg.sender][tokenAddress] = _balances[msg.sender][tokenAddress].add(amount);

        return true;
    }

    function depositEth() external payable override {
        uint256 amount = msg.value;
        require(amount > 0, "Amount should be greater than 0");

        emit Deposit(msg.sender, address(0), amount);

        _balances[msg.sender][address(0)] = _balances[msg.sender][address(0)].add(amount);
    }

    function withdrawEth(uint amount) external override returns (bool) {
        return _transfer(address(0), msg.sender, amount);
    }

    function withdrawToken(address tokenAddress, uint amount) external override checkTokenSupport(tokenAddress) returns (bool) {
        return _transfer(tokenAddress, msg.sender, amount);
    }
}
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const DROToken = artifacts.require('DROCoinContract');
const DROTokenTrust = artifacts.require('DROTokenTrust');

contract('DROTokenTrust', (accounts) => {

    const [tokenOwner, trustOwner] = accounts;

    before(async () => {
        this.token = await DROToken.new({ from: tokenOwner });
        this.trust = await DROTokenTrust.new({ from: trustOwner });
    });

    describe('Token allowance', () => {
        it('Should allow token', async () => {
            await this.trust.allowToken(this.token.address, { from: trustOwner });
            expect(await this.trust.allowedTokens(this.token.address)).to.equal(true);
        });

        it('Should disallow token', async () => {
            await this.trust.disallowToken(this.token.address, { from: trustOwner });
            expect(await this.trust.allowedTokens(this.token.address)).to.equal(false);
        });
    });

    describe('Deposit ETH', () => {
        const amount = web3.utils.toWei('1', 'ether');

        it('Should deposit ETH', async () => {
            const senderBalance = await this.trust.getEtherBalance({ from: tokenOwner });

            await this.trust.depositEth({ from: tokenOwner, value: amount, gasPrice: 0 });

            expect(await this.trust.getEtherBalance({ from: tokenOwner })).to.be.bignumber.equal(new BN(senderBalance).add(new BN(amount)));
        });

        it('Should fail to deposit ETH when not enough token on balance', async () => {
            const senderBalance = await web3.eth.getBalance(tokenOwner);

            await expectRevert(this.trust.depositEth({ from: tokenOwner, value: senderBalance + 1, gasPrice: 0 }), "sender doesn't have enough funds");

            expect(await web3.eth.getBalance(tokenOwner)).to.be.bignumber.equal(senderBalance);
        })
    });

    describe('Withdraw ETH', () => {
        const amount = web3.utils.toWei('1', 'ether');

        before(async () => {
            await this.trust.depositEth({ from: tokenOwner, value: amount, gasPrice: 0 });
        });

        it('Should withdraw ETH from contract', async () => {
            const senderBalance = await this.trust.getEtherBalance({ from: tokenOwner });

            await this.trust.withdrawEth(amount, { from: tokenOwner });

            expect(await this.trust.getEtherBalance({ from: tokenOwner })).to.be.bignumber.equal(new BN(senderBalance).sub(new BN(amount)));
        });

        it('Should fail to withdraw ether when not enough ether on a balance', async () => {
            const senderBalance = await this.trust.getEtherBalance({ from: tokenOwner });

            await expectRevert(this.trust.withdrawEth(amount + 1), 'Not enough tokens to withdraw');

            expect(await this.trust.getEtherBalance({ from: tokenOwner })).to.be.bignumber.equal(senderBalance);
        });
    });

    describe('Deposit token', () => {
        const amount = new BN(200);

        before(async () => {
            await this.token.approve(this.trust.address, amount, { from: tokenOwner });
        });

        it('Should deposit token to the contract', async () => {
            await this.trust.allowToken(this.token.address, { from: trustOwner });
            await this.trust.depositToken(this.token.address, amount);

            expect(await this.trust.getTokenBalance(this.token.address)).to.be.bignumber.equal(amount);
        });

        it('Should revert a transaction when token is not allowed', async () => {
            const senderBalance = await this.trust.getTokenBalance(this.token.address);
            await expectRevert(this.trust.depositToken(this.token.address, amount), 'ERC20: transfer amount exceeds allowance');
            
            expect(await this.trust.getTokenBalance(this.token.address)).to.be.bignumber.equal(senderBalance);
        });
    });

    describe('Withdraw tokens', () => {
        const amount = new BN(200);

        before(async () => {
            await this.token.approve(this.trust.address, amount, { from: tokenOwner });
            await this.trust.allowToken(this.token.address, { from: trustOwner });
            await this.trust.depositToken(this.token.address, amount);
        });

        it('Should withdraw token from contract', async () => {
            const senderBalance = await this.trust.getTokenBalance(this.token.address);

            await this.trust.withdrawToken(this.token.address, amount);

            expect(await this.trust.getTokenBalance(this.token.address)).to.be.bignumber.equal(new BN(senderBalance).sub(new BN(amount)));
        });

        it('Should fail to withdraw token when not enough tokens on a balance', async () => {
            const senderBalance = await this.trust.getTokenBalance(this.token.address);

            await expectRevert(this.trust.withdrawToken(this.token.address, amount + 1), 'Not enough tokens to withdraw');

            expect(await this.trust.getTokenBalance(this.token.address)).to.be.bignumber.equal(senderBalance);
        });
    });
});
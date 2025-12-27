# Privance Smart Contracts

Privacy-preserving DeFi lending smart contracts built on Zama's FHEVM using Fully Homomorphic Encryption.

## Technology Stack

- **@fhevm/solidity**: 0.10.0
- **@fhevm/hardhat-plugin**: 0.3.0-4
- **@zama-fhe/relayer-sdk**: 0.3.0-8
- **Solidity**: 0.8.24
- **Hardhat**: 2.26.3

## Contracts

### LendingMarketPlace.sol
Main contract that manages:
- Borrower data submission (encrypted)
- Credit score computation using FHE operations
- Loan request creation and matching
- Lender offer management

### CollateralManager.sol
Manages collateral deposits and liquidation:
- Deposit/withdraw collateral
- Lock collateral for active loans
- Release on repayment or liquidate on default

### RepaymentTracker.sol
Tracks loan repayment status:
- Agreement creation
- Payment tracking
- Default checking

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your private key
```

3. Compile contracts:
```bash
pnpm run compile
```

## Deployment

### Deploy to Zama Ethereum Network
```bash
pnpm run deploy:zama
```

### Network Configuration
- **Zama Ethereum**: Chain ID 8009, RPC: https://rpc.zama.ai

## FHE Operations Used

- `FHE.fromExternal()` - Import client-encrypted data
- `FHE.add/mul/div` - Arithmetic on encrypted values
- `FHE.lt/le/gt/ge` - Encrypted comparisons
- `FHE.select()` - Conditional value selection
- `FHE.allowThis/allow()` - ACL permissions

## Security

- All financial data remains encrypted on-chain
- Only data owners can decrypt their own values
- Credit scores computed entirely on encrypted data
- No plaintext exposure during computation

## License

BSD-3-Clause-Clear

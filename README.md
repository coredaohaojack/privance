<p align="center">
  <img src="https://img.shields.io/badge/Zama-FHEVM-blue?style=for-the-badge&logo=ethereum" alt="Zama FHEVM"/>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity" alt="Solidity"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
</p>

<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/coredaohaojack/privance-fhevm/main/docs/logo.png" alt="Privance" width="200">
  <br>
  Privance
  <br>
</h1>

<h4 align="center">Privacy-First DeFi Lending Platform powered by Fully Homomorphic Encryption</h4>

<p align="center">
  <a href="https://privance-frontend-three.vercel.app">
    <img src="https://img.shields.io/badge/Demo-Live-success?style=flat-square" alt="Live Demo"/>
  </a>
  <a href="https://sepolia.etherscan.io/address/0x4913b4eb032eB8f8D76bFc542dB48038115890a4">
    <img src="https://img.shields.io/badge/Contract-Verified-blue?style=flat-square" alt="Contract"/>
  </a>
  <a href="#license">
    <img src="https://img.shields.io/badge/License-BSD--3--Clause-orange?style=flat-square" alt="License"/>
  </a>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#smart-contracts">Smart Contracts</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## The Problem

Traditional DeFi lending exposes sensitive financial data on public blockchains. Users must choose between **privacy** and **access to credit**.

## The Solution

**Privance** uses **Fully Homomorphic Encryption (FHE)** to compute credit scores and match loans - all while keeping data encrypted:

```
User Data → Encrypt → Compute on Encrypted Data → Encrypted Result → Only User Decrypts
```

**No one - not even the smart contract - ever sees your actual financial information.**

---

## Key Features

<table>
  <tr>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/lock.png" width="60"/>
      <br><b>End-to-End Encryption</b>
      <br><sub>Data encrypted before leaving your browser</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/combo-chart.png" width="60"/>
      <br><b>On-Chain Credit Scoring</b>
      <br><sub>Compute scores on encrypted data</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/handshake.png" width="60"/>
      <br><b>Private Matching</b>
      <br><sub>Match borrowers & lenders securely</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/safe.png" width="60"/>
      <br><b>Collateral Management</b>
      <br><sub>Privacy-preserving deposits</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/blockchain-technology.png" width="60"/>
      <br><b>Fully On-Chain</b>
      <br><sub>No trusted intermediaries</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://img.icons8.com/fluency/96/certificate.png" width="60"/>
      <br><b>GDPR Compliant</b>
      <br><sub>Privacy by design</sub>
    </td>
  </tr>
</table>

---

## How It Works

### For Borrowers

```mermaid
graph LR
    A[Submit Encrypted Data] --> B[Compute Credit Score]
    B --> C[Request Loan]
    C --> D[Get Matched]
    D --> E[Receive Funds]
```

1. **Connect Wallet** - MetaMask on Sepolia
2. **Submit Financial Data** - Income, liabilities, repayment history (all encrypted)
3. **Compute Credit Score** - Smart contract calculates on encrypted values
4. **Request Loan** - Submit encrypted loan terms
5. **Get Funded** - Matched with compatible lenders

### For Lenders

1. **Set Criteria** - Minimum credit score, max loan amount, interest rate
2. **Fund Offer** - Deposit ETH as lending capital
3. **Auto-Match** - Protocol finds compatible borrowers
4. **Earn Interest** - Receive repayments with interest

---

## Tech Stack

<table>
  <tr>
    <td align="center"><img src="https://img.icons8.com/color/48/ethereum.png"/><br><b>Ethereum</b><br><sub>Sepolia Testnet</sub></td>
    <td align="center"><img src="https://zama.ai/favicon.ico" width="48"/><br><b>Zama FHEVM</b><br><sub>FHE Encryption</sub></td>
    <td align="center"><img src="https://img.icons8.com/fluency/48/nextjs.png"/><br><b>Next.js 15</b><br><sub>React Framework</sub></td>
    <td align="center"><img src="https://img.icons8.com/color/48/typescript.png"/><br><b>TypeScript</b><br><sub>Type Safety</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="https://img.icons8.com/color/48/tailwindcss.png"/><br><b>TailwindCSS</b><br><sub>Styling</sub></td>
    <td align="center"><img src="https://img.icons8.com/color/48/hardhat.png"/><br><b>Hardhat</b><br><sub>Smart Contracts</sub></td>
    <td align="center"><img src="https://img.icons8.com/color/48/metamask-logo.png"/><br><b>RainbowKit</b><br><sub>Wallet Connect</sub></td>
    <td align="center"><img src="https://img.icons8.com/fluency/48/triangle.png"/><br><b>Vercel</b><br><sub>Deployment</sub></td>
  </tr>
</table>

---

## Smart Contracts

Deployed on **Sepolia Testnet**:

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **LendingMarketplace** | `0x4913b4eb032eB8f8D76bFc542dB48038115890a4` | [View](https://sepolia.etherscan.io/address/0x4913b4eb032eB8f8D76bFc542dB48038115890a4) |
| **CollateralManager** | `0xA665238920d557533A7a925E8598F50F547584C8` | [View](https://sepolia.etherscan.io/address/0xA665238920d557533A7a925E8598F50F547584C8) |
| **RepaymentTracker** | `0x6d8383DA640306f5cD649B6ECBec1777024e3230` | [View](https://sepolia.etherscan.io/address/0x6d8383DA640306f5cD649B6ECBec1777024e3230) |

### FHE Operations

```solidity
// Credit score computation on encrypted data
function computeCreditScore() external {
    euint64 dti = FHE.div(encryptedLiabilities, encryptedIncome);
    euint64 score = FHE.add(baseScore, FHE.mul(repaymentScore, weight));

    // All operations on encrypted values - no plaintext exposure!
    FHE.allow(score, msg.sender); // Only user can decrypt
}
```

---

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm
- MetaMask wallet with Sepolia ETH

### Installation

```bash
# Clone the repository
git clone https://github.com/coredaohaojack/privance-fhevm.git
cd privance-fhevm

# Install dependencies
pnpm install

# Build FHE SDK
pnpm sdk:build

# Start development server
cd packages/client
npm run dev
```

### Environment Setup

Create `packages/client/.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x4913b4eb032eB8f8D76bFc542dB48038115890a4
NEXT_PUBLIC_COLLATERAL_MANAGER=0xA665238920d557533A7a925E8598F50F547584C8
NEXT_PUBLIC_REPAYMENT_TRACKER=0x6d8383DA640306f5cD649B6ECBec1777024e3230
NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## Project Structure

```
privance-fhevm/
├── packages/
│   ├── client/              # Next.js frontend
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   └── lib/             # Contract utilities
│   ├── fhevm-sdk/           # FHE SDK wrapper
│   │   ├── src/internal/    # Core FHE logic
│   │   └── src/react/       # React hooks
│   └── smart-contracts/     # Solidity contracts
│       ├── contracts/       # Main contracts
│       └── scripts/         # Deployment scripts
├── docs/                    # Documentation
└── README.md
```

---

## Security

### What FHE Protects

- Raw financial data (income, liabilities)
- Computed credit scores
- Loan amounts and terms
- Lender criteria

### What Remains Visible

- Transaction metadata (addresses, gas)
- Match success/failure (boolean)
- Contract state (loan counts)

---

## Roadmap

- [x] Core lending contracts with FHE
- [x] Credit score computation
- [x] Borrower/Lender matching
- [x] Collateral management
- [ ] Multi-token support (USDC, DAI)
- [ ] Credit delegation
- [ ] Cross-chain bridges
- [ ] Mainnet deployment

---

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## License

This project is licensed under the **BSD-3-Clause-Clear** License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Zama](https://zama.ai) - FHE technology pioneers
- [Ethereum Foundation](https://ethereum.org) - Blockchain infrastructure
- [Vercel](https://vercel.com) - Deployment platform

---

<p align="center">
  <b>Built with Privacy. Powered by Mathematics. Secured by Cryptography.</b>
</p>

<p align="center">
  <a href="https://privance-frontend-three.vercel.app">Live Demo</a> •
  <a href="https://github.com/coredaohaojack/privance-fhevm/issues">Report Bug</a> •
  <a href="https://github.com/coredaohaojack/privance-fhevm/issues">Request Feature</a>
</p>

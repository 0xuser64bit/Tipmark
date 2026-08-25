# Tipmark

![license](https://img.shields.io/badge/license-MIT-blue.svg)
![nextjs](https://img.shields.io/badge/Next.js-15.5-black)
![react](https://img.shields.io/badge/React-18.3-blue)
![typescript](https://img.shields.io/badge/TypeScript-5.6-blue)
![solana](https://img.shields.io/badge/Solana-Web3-14573c)

Tipmark is a non-custodial creator support page for Solana. A creator claims a
link, shares it, and supporters send SOL straight from their wallet to the
creator's — no platform cut, no custody, and a verifiable receipt for every
contribution.

<p align="center">
  <img src="public/tipmark-home.svg" alt="Tipmark brand preview" width="600"/>
</p>

## 📋 Table of Contents

- [Overview](#overview)
- [Design](#design)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## 🌟 Overview

Tipmark bridges the gap between content creators and their supporters in the
Web3 ecosystem. Creators build a personal page with a unique handle, share it,
receive SOL directly to their own wallet, and track every contribution in a
ledger where each row links to the transaction on-chain.

## 🎨 Design

The interface is built around one idea — **a tip jar that prints receipts**.
Money moves wallet-to-wallet and the chain keeps the record, so the UI is
stationery, not a trading terminal: warm paper, hairline rules, tabular
figures, and a single engraved-green spot colour that only ever means "money".

Three typographic voices each do one job:

- **Newsreader** (serif) — the person: names, headlines, editorial copy.
- **Geist Mono** — the machine: amounts, addresses, signatures, field labels.
- **Geist Sans** — the interface: buttons, inputs, navigation.

The design system lives in `app/globals.css` (tokens, utilities, the whole
motion budget) and `components/ui/*` (primitives). The recurring structural
element is the **ledger row** — a label/value line separated by a hairline —
which appears on the support panel, the receipt, and the dashboard.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) · React 18 · TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first `@theme`) + `tw-animate-css`
- **UI primitives**: Radix (dialog, dropdown, checkbox, label) + custom system
- **Fonts**: Geist Sans, Geist Mono, Newsreader (`next/font/local`)
- **Authentication**: NextAuth.js (Google)
- **Database**: Prisma ORM (PostgreSQL)
- **Blockchain**: Solana Web3.js + Solana Wallet Adapter
- **Uploads**: EdgeStore · **QR**: `qrcode.react` · **Export**: `html2canvas`
- **Deployment**: Vercel

## ✨ Key Features

- **Zero platform fee**: direct wallet-to-wallet transfers, non-custodial
- **Personal pages**: a claimable `tipmark.xyz/<handle>` letterhead
- **Multi-wallet**: connect any Solana wallet, with an explainer for newcomers
- **Verifiable receipts**: every contribution links to Solscan
- **Creator ledger**: real transaction table, 12-month history, live USD
- **Share card**: a downloadable PNG with a scannable QR
- **Responsive & accessible**: single design language across every screen

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun or npm
- A Solana wallet (for testing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tipmark.git
   cd tipmark
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Set up the database:
   ```bash
   # using docker
   sudo docker run -d --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e  POSTGRES_DB=postgres -p 5432:5432 postgres
   ```
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Other services
EDGE_STORE_ACCESS_KEY=
EDGE_STORE_SECRET_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Solana RPC (recommended: a dedicated mainnet RPC such as Helius/QuickNode).
# Falls back to the public mainnet cluster when empty.
NEXT_PUBLIC_SOLANA_RPC_URL=
```

## 💻 Usage

1. **Create an Account**:  
   Sign up with a unique username and connect your crypto wallet.

2. **Customize Your Profile**:  
   Add your details, social links, and a description of your work.

3. **Share Your Profile**:  
   Use your unique link (tipmark.xyz/yourusername) to receive contributions.

4. **Track Your Contributions**:  
   Access your personal dashboard to monitor earnings and manage transactions.

## 📂 Project Structure

```
tipmark/
├── actions/         # Server actions for data mutations
├── app/             # Next.js app directory with routes
├── components/      # Reusable UI components
├── db/              # Database configuration
├── lib/             # Utility functions and shared logic
├── prisma/          # Prisma schema and migrations
├── public/          # Static assets
└── ...
```

## 👥 Contributing

We welcome contributions to Tipmark! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request


## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The Solana ecosystem for providing the tools and infrastructure
- All open-source projects that made this possible
- Our early adopters and community members

---

<p align="center">
  <a href="https://tipmark.xyz">Visit Tipmark</a>
</p>

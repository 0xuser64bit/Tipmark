# Decentralized Protocol Testing Guide

This guide explains how to test Tipmark's wallet-owned Solana protocol. The
protocol is the only payment and profile path; there is no alternative mode to
compare against. Nothing in this guide targets mainnet.

## Current repository state

- The Anchor program and generated TypeScript client are implemented.
- Localnet program, receipt, and chain-scan tests pass.
- `NEXT_PUBLIC_SOLANA_CLUSTER` accepts `devnet` and `localnet` only, and a
  configured program address is required.
- There is no database, session, or upload provider. Identity is the connected
  wallet, profiles live in program accounts plus Arweave metadata, and
  contributions are read from confirmed transactions.

## Test layers

There are two useful test layers:

| Layer                | Cluster             | What it proves                                                                    | External wallet needed |
| -------------------- | ------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| Automated smoke test | Disposable localnet | Program, PDAs, direct tips, receipts, and chain-only ledger reconstruction        | No                     |
| Browser rehearsal    | Devnet              | Wallet UX, permanent Irys metadata, profile pages, and real wallet-to-wallet tips | Yes                    |

Localnet is intentionally disposable. The browser rehearsal uses devnet
because the permanent upload client rejects localnet.

## Prerequisites

- Bun, Rust, Anchor, and Solana CLI installed.
- Dependencies installed with `bun install`.
- A Solana wallet extension such as Phantom, Solflare, or Backpack for the
  devnet browser rehearsal.
- Devnet SOL only for browser testing. Never use a mainnet wallet for this
  rehearsal.

Do not commit `.env`, wallet keypairs, or RPC credentials. Use `.env.example`
as the variable-name reference.

## Automated localnet smoke test

Run the protocol test from the repository root:

```bash
NO_DNA=1 bun run protocol:integration
```

The command builds the Anchor program and generated client, starts an isolated
`solana-test-validator`, deploys the program, initializes the config PDA, and
creates fresh owner and supporter keypairs. It then:

1. Creates a profile PDA and unique username PDA.
2. Updates the profile on chain.
3. Sends a direct protocol tip from the supporter to the payout wallet.
4. Reconstructs the receipt from the confirmed transaction.
5. Verifies the profile owner, payout wallet, supporter, amount, event, and
   transfer.
6. Scans the profile PDA's signatures and checks that the ledger the creator's
   statement would show contains exactly that tip, for exactly that amount.
7. Stops the validator and removes its temporary ledger.

Step 6 is the one that proves the architecture: it uses the same code path the
dashboard does, from a process holding no state, so a pass means the ledger is
reconstructable from chain alone.

The command prints JSON containing the cluster, PDAs, transaction signatures,
receipt amount, and scanned totals. The generated keypairs and ledger are
disposable and are not written to the repository.

## Browser rehearsal on devnet

The app requires a complete devnet configuration to start. Set these values in
a private local environment or pass them to the dev server process:

```env
NEXT_PUBLIC_SOLANA_CLUSTER="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_WS_URL="wss://api.devnet.solana.com"
NEXT_PUBLIC_TIPMARK_PROGRAM_ID="<deployed-devnet-program-address>"
```

That is the whole configuration. The program must already be deployed and its
config PDA initialized on the same devnet cluster.

Deploying and initializing the program are signed devnet transactions. In an
agent-assisted session, the user must explicitly approve those transactions
after reviewing the cluster, program address, fee payer, and expected devnet
fees. The agent must never request or read a seed phrase or private key.

Restart Next.js after changing environment variables. Public Next.js variables
are read when the server starts.

Start the app:

```bash
bun run dev
```

Use a fresh browser profile, or disconnect any wallet already connected, so the
run starts from a genuinely new creator.

### Creator scenario

1. Open `http://localhost:3000`.
2. Click **Start a page**. The app goes to `/claim`.
3. Connect a devnet wallet and choose an available handle.
4. Enter a display name and payout wallet.
5. Optionally upload profile and cover images. Irys charges the connected
   wallet in devnet SOL for permanent uploads.
6. Click **Publish my page**.
7. Review the simulated `create_profile` transaction and approve it in the
   wallet. This is the only signature the flow asks for — the transaction that
   does the work.
8. Open `/<handle>` and confirm the page resolves from the profile and
   username PDAs plus hash-verified permanent metadata.
9. Open `/dashboard` and `/home` with the same wallet, then disconnect and
   confirm both fall back to the connect prompt.

### Supporter scenario

1. Open the creator's public handle in a second browser profile or window.
2. Connect a different devnet wallet.
3. Choose a small devnet SOL amount and submit the tip.
4. Review the simulated protocol transaction and approve it.
5. Confirm that the creator payout wallet receives the lamports directly.
6. Open the receipt route and verify that the amount, signer, profile PDA,
   payout wallet, event, and CPI transfer are derived from the Solana
   transaction rather than from browser-submitted fields.
7. Refresh the creator dashboard and confirm the tip appears in the ledger with
   the same amount, having been recomputed from chain.

## What the flow should show

```text
Start a page -> /claim -> connect wallet -> Irys metadata
             -> Solana profile and username PDAs
             -> direct protocol tip -> verified chain receipt
```

If a page fails to render at all, the running Next.js process is missing a
required public variable or was not restarted. If the page opens but publishing
fails, check that the program address, cluster, RPC, initialized config PDA,
wallet network, and devnet SOL all match.

## Safety boundaries

- Do not set the browser rehearsal to `mainnet-beta`.
- Do not use a mainnet-funded wallet for devnet testing.
- Never paste seed phrases or private keys into the app, repository, or chat.
- Never resend an ambiguous signed transaction. Look up its signature first.
- A passing localnet smoke test is not an audit or a mainnet release approval.
- Mainnet still requires an independent program/client audit, migration and
  rollback rehearsal, and published multisig governance.

## Useful verification commands

```bash
NO_DNA=1 bun run protocol:build
NO_DNA=1 bun run protocol:generate
NO_DNA=1 bun run protocol:test
NO_DNA=1 bun run typecheck
NO_DNA=1 bun run build
```

The authoritative architecture and operational assumptions are documented in
`architecture.md`, `operations.md`, and `security-checklist.md` in this
directory.

## New chat handoff

Start a fresh agent session from this repository and provide the following
request:

```text
Resume Tipmark's devnet browser rehearsal. Read
docs/decentralization/testing-guide.md, architecture.md, operations.md,
security-checklist.md, and task-plan.md before acting. Confirm the worktree,
branch, Solana CLI cluster, wallet public key, wallet devnet balance, program
ID, and whether the program and its config PDA already exist on devnet. Do not
access or request any private key or seed phrase. Do not touch mainnet. Before
any signed transaction, show me the exact devnet deployment or initialization
summary and wait for my explicit approval. Then run the creator and supporter
browser scenarios, verify the chain-derived receipt, and document all
signatures, failures, and remaining architecture gaps. The app has no database,
session, or upload provider; if you find any runtime dependency that
contradicts that, record it rather than working around it.
```

Expected completion evidence for that session:

1. The devnet program account is executable at the configured program ID.
2. The config PDA is initialized under the reviewed authority.
3. **Start a page** opens `/claim` and asks only for a wallet connection.
4. A wallet creates a username PDA and profile PDA with permanent metadata,
   signing exactly one protocol transaction plus any Irys funding.
5. A second wallet sends a small direct devnet SOL protocol tip.
6. The receipt verifier reconstructs the exact signer, payout, amount,
   instruction, event, and CPI transfer.
7. The creator ledger shows that tip after a full process restart.
8. Any RPC, Irys, wallet, or UX dependency discovered during the rehearsal is
   recorded rather than hidden.

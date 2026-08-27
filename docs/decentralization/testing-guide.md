# Decentralized Protocol Testing Guide

This guide explains how to test Tipmark's wallet-owned Solana protocol. The
protocol is the only payment and profile path; there is no alternative mode to
compare against. Nothing in this guide targets mainnet.

## Current repository state

- The Anchor program and generated TypeScript client are implemented.
- Localnet program, receipt, indexer, deletion, and replay tests pass.
- The protocol is always on. `NEXT_PUBLIC_SOLANA_CLUSTER` accepts `devnet` and
  `localnet` only, and a configured program address is required.
- PostgreSQL is non-authoritative for profiles, payouts, and receipts, but the
  current browser publisher still uses a PostgreSQL-backed, one-time wallet
  challenge for replay protection. Removing that runtime dependency requires
  a separate stateless or decentralized challenge implementation.

## Test layers

There are two useful test layers:

| Layer                | Cluster             | What it proves                                                                    | External wallet needed |
| -------------------- | ------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| Automated smoke test | Disposable localnet | Program, PDAs, direct tips, receipts, and cache replay                            | No                     |
| Browser rehearsal    | Devnet              | Wallet UX, permanent Irys metadata, profile pages, and real wallet-to-wallet tips | Yes                    |

Localnet is intentionally disposable. The browser rehearsal uses devnet
because the permanent upload client supports Solana devnet and mainnet only;
it rejects localnet.

## Prerequisites

- Bun, Rust, Anchor, Solana CLI, and PostgreSQL tooling installed.
- Dependencies installed with `bun install`.
- A Solana wallet extension such as Phantom, Solflare, or Backpack for the
  devnet browser rehearsal.
- Devnet SOL only for browser testing. Never use a mainnet wallet for this
  rehearsal.

Do not commit `.env`, wallet keypairs, OAuth credentials, RPC credentials, or
Irys configuration. Use `.env.example` as the variable-name reference.

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
6. Stops the validator and removes its temporary ledger.

The command prints JSON containing the cluster, PDAs, transaction signatures,
and receipt amount. The generated keypairs and ledger are disposable and are
not written to the repository.

## Disposable database and replay test

Run:

```bash
NO_DNA=1 bun run protocol:integration:replay
```

This starts a temporary PostgreSQL cluster in addition to the temporary
validator. It indexes the verified tip into PostgreSQL, deletes the protocol
cache and checkpoint, backfills the same signatures from Solana, and checks
that the exact tip is restored. A passing run demonstrates that PostgreSQL is
an optional read cache rather than the source of ownership, payout, or receipt
truth.

## Browser rehearsal on devnet

The app requires a complete devnet configuration to start. Set these values in
a private local environment or pass them to the dev server process:

```env
NEXT_PUBLIC_SOLANA_CLUSTER="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_WS_URL="wss://api.devnet.solana.com"
NEXT_PUBLIC_TIPMARK_PROGRAM_ID="<deployed-devnet-program-address>"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<local-development-secret>"
DATABASE_URL="<local-postgresql-url>"
```

The program must already be deployed and its config PDA initialized on the
same devnet cluster. `NEXTAUTH_URL` must match the port in the browser. If the
dev server uses port `3001`, use `http://localhost:3001` instead.

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

Use a private browser window or sign out first so an existing Google session
does not send the landing page directly to `/home`.

### Creator scenario

1. Open `http://localhost:3000`.
2. Click **Start a page**. The app goes to `/claim`.
3. Connect a devnet wallet and choose an available handle.
4. Enter a display name and payout wallet.
5. Optionally upload profile and cover images. Irys charges the connected
   wallet in devnet SOL for permanent uploads.
6. Click **Publish my page**.
7. Approve the wallet authorization message. This proves control of the
   wallet; it is not a payment.
8. Review the simulated `create_profile` transaction and approve it in the
   wallet.
9. Open `/<handle>` and confirm the page resolves from the profile and
   username PDAs plus hash-verified permanent metadata.

The protocol editor may update a legacy database row as a convenience cache
when an email session exists. A cache failure after a confirmed transaction is
reported as a warning and must not make the on-chain profile disappear.

The wallet authorization challenge itself currently requires PostgreSQL even
without Google authentication. This challenge is short-lived and is not the
authority for the resulting profile, but the browser publish flow will not
finish if the challenge database is unavailable.

### Supporter scenario

1. Open the creator's public handle in a second browser profile or window.
2. Connect a different devnet wallet.
3. Choose a small devnet SOL amount and submit the tip.
4. Review the simulated protocol transaction and approve it.
5. Confirm that the creator payout wallet receives the lamports directly.
6. Open the receipt route and verify that the amount, signer, profile PDA,
   payout wallet, event, and CPI transfer are derived from the Solana
   transaction rather than from browser-submitted fields.
7. Refresh the creator dashboard and compare chain-derived earnings with the
   optional indexer cache.

## What the flow should show

```text
Start a page -> /claim -> wallet signature -> Irys metadata
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
bunx prisma validate
```

For operational cache checks after a devnet rehearsal:

```bash
TIPMARK_INDEXER_MODE=incremental bun run protocol:index
TIPMARK_INDEXER_MODE=backfill TIPMARK_INDEXER_PAGES=100 bun run protocol:index
bun run protocol:reconcile
```

The authoritative architecture and operational assumptions are documented in
`architecture.md`, `operations.md`, and `security-checklist.md` in this
directory.

## New chat handoff

Start a fresh agent session from this repository and provide the following
request:

```text
Resume Tipmark's decentralized protocol browser rehearsal. Read
docs/decentralization/testing-guide.md, architecture.md, operations.md,
security-checklist.md, and task-plan.md before acting. Confirm the worktree,
branch, remote PR, Solana CLI cluster, wallet public key, wallet devnet balance,
program ID, and whether the program already exists on devnet. Do not access or
request any private key or seed phrase. Do not touch mainnet. Before any signed
transaction, show me the exact devnet deployment or initialization summary and
wait for my explicit approval. After deployment, configure the local app with
the protocol configured for devnet, run the creator and supporter browser
scenarios,
verify the chain-derived receipt and database replay behavior, and document
all signatures, failures, and remaining architecture gaps. Do not claim the
system is database-free while wallet challenges still require PostgreSQL.
```

Expected completion evidence for that session:

1. The devnet program account is executable at the configured program ID.
2. The config PDA is initialized under the reviewed authority.
3. **Start a page** opens `/claim` without Google OAuth.
4. A wallet creates a username PDA and profile PDA with permanent metadata.
5. A second wallet sends a small direct devnet SOL protocol tip.
6. The receipt verifier reconstructs the exact signer, payout, amount,
   instruction, event, and CPI transfer.
7. Protocol cache deletion and replay restore the same verified contribution.
8. Any PostgreSQL, RPC, Irys, wallet, or UX dependency discovered during the
   rehearsal is recorded rather than hidden.

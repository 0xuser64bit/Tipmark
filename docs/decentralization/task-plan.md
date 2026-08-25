# Decentralization Execution Plan

This plan is intentionally commit-oriented. Each commit must build, test, and
leave the existing application usable unless the task explicitly changes a
feature behind a flag.

## Phase 0: Contract and safety baseline

- [x] Record the ownership, payment, storage, migration, and security model.
- [ ] Add an explicit protocol version and feature-flag configuration.
- [ ] Add deterministic test fixtures and a local cluster test command.

## Phase 1: On-chain program

- [ ] Scaffold an Anchor workspace pinned to the installed toolchain.
- [ ] Implement config, profile PDA, and username PDA accounts.
- [ ] Implement owner-authorized profile creation and updates.
- [ ] Implement zero-fee direct SOL tips with a `TipReceived` event.
- [ ] Add account, signer, PDA, amount, and payout validation.
- [ ] Add unit tests for happy paths and adversarial account substitutions.
- [ ] Add local integration tests for profile, tip, and receipt reconstruction.

## Phase 2: Client and verification

- [ ] Generate the program IDL and a type-safe TypeScript client.
- [ ] Add canonical PDA derivation and username normalization helpers.
- [ ] Build instructions through the generated client, not hand-coded layouts.
- [ ] Add transaction simulation and explicit confirmation-state handling.
- [ ] Verify receipts from chain data rather than browser-submitted fields.

## Phase 3: Wallet-owned identity

- [ ] Add wallet-signature authentication with nonce, domain, and expiry.
- [ ] Keep email only as an optional notification identity.
- [ ] Add wallet-first onboarding and profile editing.
- [ ] Resolve public handles from chain first, with legacy fallback.
- [ ] Add a migration command for creators who control their stored wallet.

## Phase 4: Permanent metadata

- [ ] Define and validate versioned profile metadata JSON.
- [ ] Add browser wallet upload to Arweave/Irys.
- [ ] Store only URI and content hash in the profile account.
- [ ] Add gateway fallback and metadata validation limits.
- [ ] Replace EdgeStore URLs for migrated profiles.

## Phase 5: Chain-derived product surfaces

- [ ] Rebuild public profile data from profile PDA plus metadata.
- [ ] Rebuild receipts from verified program transactions.
- [ ] Rebuild creator earnings from verified `TipReceived` events.
- [ ] Remove the client-to-database transaction write path.
- [ ] Preserve the legacy dashboard as a comparison view during migration.

## Phase 6: Rebuildable indexing and operations

- [ ] Add a replayable indexer with slot/signature checkpoints.
- [ ] Add reconciliation against RPC transaction details.
- [ ] Make PostgreSQL explicitly non-authoritative in code and documentation.
- [ ] Add health checks, RPC failover, retries, rate limits, and structured logs.
- [ ] Add self-hosted/static frontend and mirrored metadata deployment guidance.

## Phase 7: Release gates

- [ ] Run TypeScript, Rust, build, unit, integration, and browser tests.
- [ ] Run a program security checklist and independent review.
- [ ] Deploy only to devnet until migration and recovery are exercised.
- [ ] Document upgrade authority, multisig, pause policy, and incident response.
- [ ] Write the mainnet migration runbook and rollback boundaries.

## Definition of done

The decentralized release is complete only when a fresh user can connect a
wallet, claim a unique handle, publish metadata, receive a direct zero-fee
tip, and view a chain-verified receipt without Google, PostgreSQL, EdgeStore,
or a Tipmark-controlled custody account. Optional caches may improve speed but
must be deletable and rebuildable from public state.

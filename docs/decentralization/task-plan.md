# Decentralization Execution Plan

This plan is intentionally commit-oriented. Each commit must build, test, and
leave the existing application usable unless the task explicitly changes a
feature behind a flag.

## Phase 0: Contract and safety baseline

- [x] Record the ownership, payment, storage, migration, and security model.
- [x] Add an explicit protocol version and feature-flag configuration.
- [x] Add deterministic test fixtures and a local cluster test command.

## Phase 1: On-chain program

- [ ] Scaffold an Anchor workspace pinned to the installed toolchain.
- [ ] Implement config, profile PDA, and username PDA accounts.
- [ ] Implement owner-authorized profile creation and updates.
- [ ] Implement zero-fee direct SOL tips with a `TipReceived` event.
- [ ] Add account, signer, PDA, amount, and payout validation.
- [ ] Add unit tests for happy paths and adversarial account substitutions.
- [ ] Add local integration tests for profile, tip, and receipt reconstruction.

## Phase 2: Client and verification

- [x] Generate the program IDL and a type-safe TypeScript client.
- [x] Add canonical PDA derivation and username normalization helpers.
- [x] Build instructions through the generated client, not hand-coded layouts.
- [x] Add transaction simulation and explicit confirmation-state handling.
- [x] Verify receipts from chain data rather than browser-submitted fields.

## Phase 3: Wallet-owned identity

- [x] Add wallet-signature authentication with nonce, domain, and expiry.
- [x] Keep email only as an optional notification identity.
- [x] Add wallet-first onboarding and profile editing.
- [x] Resolve public handles from chain first, with legacy fallback.
- [x] Add a migration guard for creators who control their stored wallet.

## Phase 4: Permanent metadata

- [x] Define and validate versioned profile metadata JSON.
- [x] Add browser wallet upload to Arweave/Irys.
- [x] Store only URI and content hash in the profile account.
- [x] Add gateway fallback and metadata validation limits.
- [x] Replace EdgeStore URLs for protocol profiles.

## Phase 5: Chain-derived product surfaces

- [x] Rebuild public profile data from profile PDA plus metadata.
- [x] Rebuild receipts from verified program transactions.
- [x] Rebuild creator earnings from verified `TipReceived` events.
- [x] Remove the client-to-database transaction write path for protocol tips.
- [x] Preserve the legacy dashboard as a comparison view during migration.

## Phase 6: Rebuildable indexing and operations

- [x] Add a replayable indexer with slot/signature checkpoints.
- [x] Add reconciliation against RPC transaction details.
- [x] Make PostgreSQL explicitly non-authoritative in code and documentation.
- [x] Add RPC failover and bounded read retries.
- [x] Add operational runbooks and mirrored metadata guidance.

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

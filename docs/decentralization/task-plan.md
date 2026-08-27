# Decentralization Execution Plan

This plan is intentionally commit-oriented. Each commit must build, test, and
leave the application usable.

## Phase 0: Contract and safety baseline

- [x] Record the ownership, payment, storage, migration, and security model.
- [x] Add an explicit protocol version and configuration.
- [x] Add deterministic test fixtures and a local cluster test command.

## Phase 1: On-chain program

- [x] Scaffold an Anchor workspace pinned to the installed toolchain.
- [x] Implement config, profile PDA, and username PDA accounts.
- [x] Implement owner-authorized profile creation and updates.
- [x] Implement zero-fee direct SOL tips with a `TipReceived` event.
- [x] Add account, signer, PDA, amount, and payout validation.
- [x] Add unit tests for happy paths and adversarial account substitutions.
- [x] Add local integration tests for profile, tip, and receipt reconstruction.

## Phase 2: Client and verification

- [x] Generate the program IDL and a type-safe TypeScript client.
- [x] Add canonical PDA derivation and username normalization helpers.
- [x] Build instructions through the generated client, not hand-coded layouts.
- [x] Add transaction simulation and explicit confirmation-state handling.
- [x] Verify receipts from chain data rather than browser-submitted fields.

## Phase 3: Wallet-owned identity

- [x] Add wallet-first onboarding and profile editing.
- [x] Resolve public handles from chain, with no database fallback.
- [x] Make the connected wallet the only identity; remove Google and sessions.
- [x] Remove the server-side wallet challenge — the program's owner-signer
      check is the authorization, so the challenge protected nothing.

## Phase 4: Permanent metadata

- [x] Define and validate versioned profile metadata JSON.
- [x] Add browser wallet upload to Arweave/Irys.
- [x] Store only URI and content hash in the profile account.
- [x] Add gateway fallback and metadata validation limits.
- [x] Remove EdgeStore.

## Phase 5: Chain-derived product surfaces

- [x] Rebuild public profile data from profile PDA plus metadata.
- [x] Rebuild receipts from verified program transactions.
- [x] Rebuild creator earnings from verified `TipReceived` events.
- [x] Remove every client-to-database write path.
- [x] Remove PostgreSQL, Prisma, and the tip indexer entirely.

## Phase 6: Operations

- [x] Add RPC failover and bounded read retries.
- [x] Add operational runbooks and mirrored metadata guidance.
- [x] Prove the localnet smoke test reconstructs a tip from chain alone.
- [ ] Batch and cache contribution reads so a busy profile stays responsive
      without reintroducing authoritative local state.

## Phase 7: Release gates

- [x] Run TypeScript, Rust, build, unit, and local integration tests.
- [x] Run the program security checklist; independent review remains required.
- [x] Keep deployment checks scoped to devnet until recovery is exercised.
- [x] Document upgrade authority, multisig, pause policy, and incident response.
- [ ] Move the upgrade and config authority to a multisig. A single key can
      still replace the program for everyone; this is the largest remaining
      centralization in the system.
- [ ] Write the mainnet migration runbook and rollback boundaries.

## Definition of done

A fresh user can connect a wallet, claim a unique handle, publish metadata,
receive a direct zero-fee tip, and view a chain-verified receipt without
Google, PostgreSQL, EdgeStore, or a Tipmark-controlled custody account.

Phases 3 to 5 satisfy this: the deployment stores nothing and holds no secrets.
Any cache added later must be ephemeral and rebuildable from public state.

# Tipmark Decentralization Architecture

**Status:** Implementation baseline

**Scope:** Wallet-owned creator profiles, direct zero-fee SOL support,
permanent metadata, and reconstructable public data.

## Product invariant

Tipmark must never custody supporter funds or require a Tipmark-controlled
account to receive a contribution. The canonical payment path is a Solana
transaction that moves lamports directly from the supporter to the creator's
configured payout wallet. The Tipmark program may validate and emit a record,
but it must not hold a balance, charge a platform fee, or provide a withdrawal
instruction.

## Canonical data model

The Solana program is authoritative for ownership and payment routing. Permanent
metadata storage is authoritative for profile presentation. Any database or
indexer is a rebuildable read cache and must not be required to prove ownership,
route funds, or validate a payment.

### Profile PDA

`["profile", owner]`

Stores the wallet authority, payout wallet, immutable normalized username,
metadata URI, active flag, and timestamps. The owner signer is required for
every mutation. The initial implementation keeps the username immutable to
avoid ambiguous link history; a future username-transfer instruction must be a
separate audited change.

### Username PDA

`["username", username_bytes]`

Stores the profile owner and profile PDA. Creating this account makes a handle
unique on-chain. Usernames are ASCII lowercase, 2-30 bytes, and limited to
`a-z`, `0-9`, and `-` so every client derives identical addresses.

### Tip instruction

The supporter signs a `tip` instruction containing a positive lamport amount.
The program checks that the profile is active and that the writable payout
account equals the profile's payout wallet, then invokes the System Program to
transfer the exact amount. A `TipReceived` event includes the profile owner,
supporter, payout wallet, amount, and optional client reference. The event is
an indexing aid; the transaction account metas and transfer are independently
verifiable.

## Instruction surface

- `initialize_config`: create the protocol configuration PDA; authority is a
  multisig during the governed period.
- `create_profile`: initialize a wallet-owned profile and unique username.
- `update_profile`: update payout wallet, metadata URI, or active status; the
  profile owner must sign.
- `tip`: transfer lamports directly to the configured payout wallet and emit a
  contribution event.
- `close_profile`: optional later instruction, disabled until username-history
  and migration semantics are explicitly designed.

There is no treasury, fee account, withdrawal path, or administrator transfer
authority in the payment instruction.

## Metadata and images

Profile accounts hold a content-addressed URI and a content hash, not image
bytes. Metadata JSON is uploaded from the creator's wallet to Arweave through
Irys (with IPFS pinning as a gateway fallback during migration). The JSON
contains a version, display fields, social links, and image CIDs. Sensitive
information, email addresses, and notification preferences never go on-chain
or into permanent storage.

Version 1 metadata is canonical JSON with bounded display name, Markdown bio,
`ar://` or `ipfs://` image URIs, and normalized social handles. Clients hash
that exact canonical byte sequence with SHA-256 and must reject gateway data
whose hash or schema does not match the profile account.

Permanent storage is intentionally append-only. Updating a profile creates a
new metadata object and updates the profile URI; old objects remain addressable
and must not be presented as deletable user data.

## Identity and migration

New accounts use wallet signatures instead of Google as the ownership proof.
The web app may still provide an optional email notification feature, but an
email session cannot mutate an on-chain profile.

Existing database profiles migrate by having the creator sign with the wallet
currently stored in `solana_public_key`. The migration tool verifies the
signature, claims the handle on-chain, publishes metadata, and records the
result in the database as a cache marker. Profiles without a controlled wallet
cannot be trustlessly claimed by Tipmark; they require an explicit recovery
policy and must not be silently reassigned.

During migration, public routes resolve on-chain profiles first and fall back to
legacy database profiles only when no on-chain claim exists. This preserves old
links while making the new protocol progressively authoritative.

The fallback is feature-flagged during rollout. Once a username PDA exists,
invalid account relationships or metadata hash/schema failures are treated as
an unavailable profile rather than silently replaced with a database row.

## Indexing and reads

The first implementation reads profile accounts and transaction signatures
from an RPC provider. A disposable indexer then consumes program logs and
confirmed signatures into PostgreSQL for fast dashboards. Indexer rows include
the source slot and signature and are periodically reconciled against chain
state. Deleting the database must not delete protocol state or break receipt
verification.

Receipts validate the transaction from Solana, including the program
instruction, profile PDA, payout wallet, lamport amount, and confirmation
status. Client-submitted amount or address fields are never trusted as payment
proof.

## Security invariants

- Every profile mutation requires the profile owner signer.
- Every PDA has deterministic, validated seeds and the expected program owner.
- The payout account is checked against the stored payout wallet before CPI.
- The System Program account is typed and cannot be replaced by an arbitrary
  program.
- Zero-value and overflowing amounts are rejected.
- Pausing profile creation does not pause or redirect existing payouts unless a
  separately governed emergency mechanism is later approved.
- Upgrade authority is a multisig with a timelock during development and is
  revoked only after an external audit and migration freeze.
- RPC responses, metadata, and indexer rows are treated as untrusted input.

## Rollout boundaries

1. Build and test the program locally without touching mainnet.
2. Deploy to devnet and run wallet-to-wallet integration tests.
3. Add on-chain reads and verification behind a feature flag.
4. Migrate volunteer creators and compare chain-derived data with the legacy
   database.
5. Make on-chain profiles authoritative for migrated handles.
6. Publish the indexer and metadata tooling so anyone can rebuild the cache.
7. Audit, multisig-govern, and only then consider mainnet deployment.

No mainnet transaction or program deployment is authorized by this plan.

Builds use `anchor build --ignore-keys` so the committed program ID and IDL are
reproducible without checking in a local deployment keypair. Deployment
keypairs and upgrade-authority custody are external operational secrets; the
first config initialization must be signed by the loader upgrade authority.

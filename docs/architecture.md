# Architecture

How Tipmark stores ownership, routes money, and proves what happened. This is the
authoritative description of the current system; it is not a roadmap.

## The invariant everything else serves

Tipmark never custodies supporter funds and never requires a Tipmark-controlled
account to receive a contribution. The canonical payment path is a Solana
transaction that moves lamports directly from the supporter to the creator's
configured payout wallet. The program validates and records; it does not hold a
balance, charge a fee, or expose a withdrawal instruction.

## Where state lives

| Concern                                         | Authority                     |
| ----------------------------------------------- | ----------------------------- |
| Ownership, handle uniqueness, payout routing    | Solana program accounts       |
| Profile presentation (name, bio, images, links) | Arweave, content-addressed    |
| Contribution history and totals                 | Confirmed Solana transactions |
| Application state                               | None. There is no database    |

Nothing is cached that is not reconstructable from chain, and no cache is ever
consulted to authorize anything. There are two: the contribution scan
(`lib/protocol/contributions.ts`), held 30 seconds per profile address because it
is the most expensive read and anonymous traffic can trigger it, and the SOL
price (`actions/getSolPrice`), held 60 seconds and purely cosmetic.

## Program

Program address `7ZNWrEBx3QnTamR8ZZKwbksKvHhby3bg3W3akiz183TT`, pinned in
`Anchor.toml`, `idls/tipmark_protocol.json`, and the generated client. Built with
`anchor build --ignore-keys` so the committed program ID and IDL are reproducible
without a local deployment keypair in the repository.

### Accounts

**Config** — `["config"]`. Governance authority, a pending authority for two-step
transfer, a profile-creation pause flag, version, bump. `initialize_config`
additionally requires that the passed `program_data` account is the program's
real programdata address _and_ that its upgrade authority is the signer — so the
first initialization can only be performed by the loader upgrade authority.

**Profile** — `["profile", owner]`, 423 bytes. Owner, payout wallet, normalized
username, metadata URI, 32-byte metadata hash, active flag, timestamps, version,
bump. The owner must sign every mutation.

The username is **immutable** by construction: `update_profile` has no username
field. That avoids ambiguous link history. A transfer instruction would be a
separate, audited change.

**Username record** — `["username", username_bytes]`, 104 bytes. Holds the owner
and the profile PDA. Creating it is what makes a handle unique on chain.
Usernames are 2–30 UTF-8 bytes of `a-z`, `0-9`, and single interior dashes, so
every client derives identical addresses. The same grammar is implemented twice —
`programs/tipmark_protocol/src/validation.rs` and `lib/protocol/username.ts` —
with a shared fixture list asserted on both sides.

### Instructions

| Instruction                   | Signer                   | Effect                                                     |
| ----------------------------- | ------------------------ | ---------------------------------------------------------- |
| `initialize_config`           | loader upgrade authority | Create the config PDA                                      |
| `create_profile`              | creator                  | Create profile + username PDAs                             |
| `update_profile`              | profile owner            | Payout wallet, metadata URI/hash, active flag              |
| `tip`                         | supporter                | Transfer lamports to the payout wallet, emit `TipReceived` |
| `set_profile_creation_paused` | config authority         | Pause new claims                                           |
| `propose_protocol_authority`  | config authority         | Step 1 of authority transfer                               |
| `accept_protocol_authority`   | pending authority        | Step 2 of authority transfer                               |

There is no close, withdraw, fee, or treasury instruction, and no administrator
path that can redirect a payment.

### Enforced invariants

- Every profile mutation requires the profile owner as signer. `update_profile`
  enforces it with `has_one = owner` plus canonical seeds and the stored bump;
  `create_profile` derives the bump instead, because the account does not exist
  yet.
- `tip` checks the profile is active, that the writable payout account equals the
  stored payout wallet, that it is not the supporter, and that the amount is
  non-zero, before CPIing to the typed `Program<System>` — which cannot be
  substituted for an arbitrary program.
- `metadata_uri` must be `ar://` or `ipfs://`; `https://` is rejected outright,
  because a mutable URL cannot be content-addressed. The hash must be non-zero.
- PDA initialization (`programs/tipmark_protocol/src/account_init.rs`) requires
  the target to be system-owned and empty, then tops up a **prefunded** PDA to
  rent-exemption and allocates/assigns under the seeds. A griefer prefunding
  someone's profile PDA is therefore harmless rather than a denial of service.
  The localnet smoke test prefunds deliberately to keep this path covered.
- Pausing profile creation does not pause or redirect existing payouts.
- The release profile enables `overflow-checks`.

## Metadata

Profile accounts store a content-addressed URI and a hash, never image bytes.
Version 1 metadata is canonical JSON — a fixed key set, bounded display name
(120), Markdown bio (4000), URI (300) and handles (64), image URIs restricted to
`ar://` or `ipfs://`. The creator's wallet signs and funds the upload to Arweave
through Irys; there is no server-side upload path and no provider account.

Clients hash the exact canonical byte sequence with SHA-256 and **reject** gateway
data whose hash or schema does not match the profile account. A profile whose
metadata cannot be fetched or verified is presented as unavailable — never
silently substituted. Nothing sensitive goes on chain or into permanent storage;
a test asserts the metadata JSON carries no email field.

Permanent storage is append-only. Updating a profile publishes a new object and
points the profile URI at it; old objects remain addressable and must not be
presented to users as deletable.

## Reads and verification

Public routes resolve handles from the username and profile PDAs. There is no
database fallback: a handle no username PDA claims does not exist. Resolution
verifies program ownership, exact account sizes, version, canonical bumps, and
the cross-links in both directions (the record's profile is the derived PDA; the
record's owner is the profile's owner).

Both read paths fail over across `NEXT_PUBLIC_SOLANA_RPC_URLS`, in order, with
bounded retries — two attempts per endpoint by default. They use different
transports, `@solana/kit` for accounts and `@solana/web3.js` for signature scans,
so `withEndpointFailover` in `lib/solana/rpc.ts` takes the client factory as a
parameter: the transport varies, the policy must not.

Deterministic errors are never retried and never failed over, because trying
another provider cannot change the answer. That is enforced by type, not by
convention: `TipReceiptVerificationError` and `PublicProfileResolutionError` both
extend `NonRetryableRpcReadError`, so a forged receipt or a profile whose hash
does not match is rejected on the first endpoint. An outage makes a page slow; a
verification failure makes it unavailable, immediately.

**Signed writes never fail over at all**: repeating an ambiguous write can
duplicate a payment. If a signature's fate is unknown, look the signature up.

Receipt verification (`lib/protocol/tip-receipt.ts`) is the strongest check in
the codebase, and it trusts nothing the browser submitted. For a signature to be
a valid receipt it must have: no transaction error; the signature as the
transaction's first; exactly one top-level instruction to the program whose
discriminator is `tip` and whose fourth account is the System Program; exactly one
`TipReceived` event, decoded only from log lines emitted while the program is top
of the invoke stack; exactly one inner System transfer beneath that instruction; a
supporter who signed the transfer source; and agreement between instruction,
event, and transfer on supporter, payout wallet, amount, and reference. Finally
the event's profile must re-derive from `["profile", profile_owner]`.

Earnings scan the profile PDA's signatures in pages — 10 × 1000 by default,
capped at 100 × 1000 — batch the status and transaction lookups, drop rows whose
event names a different profile, and summarize in memory.

## Trade-offs taken deliberately

- **No index.** Recomputing from chain is slower than a maintained index, and it
  removes an entire class of failure: nothing to rebuild after an outage, and no
  stored total that can disagree with the ledger.
- **Immutable usernames.** Simpler and link-safe, at the cost of no renames.
- **Wallet-only identity.** No password reset, no support-desk recovery, no
  session to steal. Losing the wallet loses the page.
- **Devnet-only cluster gate.** `getProtocolConfig` throws on anything other than
  devnet or localnet, so reaching mainnet is a reviewed code change rather than
  an environment typo. Note the gate is on the parsed cluster, not the raw
  string: `parseSolanaCluster` maps an unrecognized value to `devnet`, so a typo
  runs on devnet rather than failing loudly.

## Remaining centralization

One thing: the program upgrade authority and the config authority. The deployment
holds no secrets, but a single upgrade key could replace the program under
everyone. Moving both to a multisig with a published threshold and timelock is
the largest outstanding item, and it is a precondition for mainnet along with an
independent audit. See [operations.md](operations.md).

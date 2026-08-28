# Operations

For whoever runs a Tipmark deployment. See [architecture.md](architecture.md) for
why the system is shaped this way.

## Clusters and endpoints

Keep `NEXT_PUBLIC_SOLANA_CLUSTER` explicit: `localnet` for program tests,
`devnet` for wallet and Irys rehearsal. `testnet` and `mainnet-beta` throw, so
mainnet is a deliberate code change rather than an environment typo. An
unrecognised value falls back to `devnet` rather than failing, so a typo here is
quiet — check it when a deployment behaves unexpectedly.

`NEXT_PUBLIC_SOLANA_RPC_URL` is the primary endpoint, used by browser wallet
connections and by writes. `NEXT_PUBLIC_SOLANA_RPC_URLS` is an ordered
comma-separated read-failover list covering both read paths — account reads and
signature scans. Every entry must be the same cluster with compatible transaction
history. **Set at least one.** With a single endpoint, that endpoint's outage is
the site's outage.

Browser bundles inline every `NEXT_PUBLIC_*` value at build time. Redeploy after
changing one.

**Never fail over a signed write.** Once the wallet has returned a signature,
look that signature up through the read path. A retried read is free; a repeated
ambiguous write can create a duplicate payment.

## Release gates

Run in order. A passing build is not a mainnet authorization.

1. `bun run protocol:build` — Anchor build, IDL normalization, IDL copied to
   `idls/`. Review the IDL and generated-client diff and confirm it is intended.
2. `bun run protocol:generate` — regenerate the client if the IDL changed.
3. `bun run typecheck`, `bun test`, `bun run lint`, `bun run build`.
4. `bun run protocol:test` — Rust tests, clippy, and the TypeScript suite.
5. `bun run protocol:integration` — isolated localnet: deploy, initialize config,
   claim, tip, verify the receipt, and reconstruct the ledger from a process
   holding no state.
6. Exercise the devnet browser rehearsal (claim, upload, update, tip, receipt) as
   described in [CONTRIBUTING.md](../CONTRIBUTING.md).
7. Confirm the ledger and public profile reproduce identical totals from a fresh
   process, with no local state carried over.
8. `bun run protocol:release-check` with the devnet program address and the
   public multisig metadata. This must pass before any deployment change.
9. Obtain independent program and client review before opening a deployment to
   real users.

The release check takes public values only:

```bash
TIPMARK_RELEASE_CLUSTER=devnet \
TIPMARK_PROGRAM_ADDRESS=... \
TIPMARK_UPGRADE_AUTHORITY=... \
TIPMARK_MULTISIG_ADDRESS=... \
TIPMARK_MULTISIG_THRESHOLD=2 \
TIPMARK_MULTISIG_SIGNERS=...,... \
bun run protocol:release-check
```

It rejects any cluster but devnet, invalid addresses, a threshold below 2, a
threshold exceeding the signer count, duplicate signers, and an upgrade authority
equal to the program address. It also asserts the program address matches both
`Anchor.toml` and the committed IDL.

## Deploying the app

The app is a stock Next.js deployment (currently Vercel). It needs the public
environment variables and nothing else — no database to provision, no secret to
rotate, no storage bucket to grant. Record the program address, cluster,
authority, and upgrade authority outside the repository.

## Rebuilding a deployment

There is nothing to restore. A new deployment needs a program address, a cluster,
and an RPC endpoint; profiles, payout routing, and contribution history are read
from Solana and Arweave on first request. Verify a rebuild by opening a known
handle and its ledger and comparing totals against the explorer.

## Incident response

**RPC outage.** Add a healthy same-cluster endpoint to
`NEXT_PUBLIC_SOLANA_RPC_URLS`, redeploy, and verify receipt lookups. Do not
resend transactions whose signatures are unknown.

**Metadata gateway outage.** Preserve the on-chain URI and hash and try the next
configured Arweave/IPFS gateway. A profile whose metadata cannot be fetched, or
whose hash does not match, is unavailable — never substituted.

**Program vulnerability.** Pause profile creation through the governed config
authority, state the affected cluster publicly, preserve signatures and logs, and
follow the audited upgrade or migration policy. The `tip` instruction has no
treasury or withdrawal path to drain, so existing payout routing is unaffected by
a creation pause.

**Suspected forged receipt.** Receipt verification is deterministic and
non-retryable by design; a failure is an answer, not a transport problem. Capture
the signature and the verifier error rather than retrying against another
provider.

## Upgrade authority and keys

The program upgrade authority and the config authority must be held by a multisig
with a documented threshold and timelock. This is the only meaningful
centralization left in the system: the deployment holds no secrets, but a single
upgrade key could replace the program under everyone.

Deployment keypairs and multisig signers are operational secrets. They are never
committed, never pasted into an issue, and never requested from a user. Revoke
upgrade authority only after an independent audit, a migration freeze, a recovery
drill, and a published rollback boundary.

## Data retention

There is no application data to retain. The profile PDA, the username PDA, the
permanent metadata object, and the confirmed Solana transactions are the entire
record, and none of them are ours to delete. Losing the deployment cannot change
ownership, payout routing, profile content, or receipt validity.

## Before mainnet

Not authorized by any passing check in this repository. Required first:

- Independent Anchor/Solana program audit.
- Independent client, metadata, and operational review.
- Upgrade and config authority moved to a multisig, with the threshold, timelock,
  pause procedure, and rollback boundary published.
- A migration and rollback rehearsal that has actually been run.

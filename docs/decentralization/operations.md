# Decentralized Operations Runbook

## Clusters and endpoints

Keep `NEXT_PUBLIC_SOLANA_CLUSTER` explicit. Use `localnet` for program tests and
`devnet` for wallet and Irys rehearsal. Mainnet is a release decision, not a
default. `NEXT_PUBLIC_SOLANA_RPC_URL` is the primary endpoint used by browser
wallet connections and writes. `NEXT_PUBLIC_SOLANA_RPC_URLS` is an ordered,
comma-separated server read-failover list; it must contain providers with the
same cluster and compatible transaction history.

Never fail over a signed write after the wallet returns a signature. Look up
that signature through the read failover policy instead. A retry can safely
repeat a read, but repeating an ambiguous write can create a duplicate payment.

## Protocol release gates

1. Build the Anchor program with `NO_DNA=1 bun run protocol:build` and verify
   the generated IDL/client diff is intentional.
2. Run `NO_DNA=1 bun run protocol:test`, `bun run typecheck`, and `bun run build`.
3. Start a local validator or use a dedicated devnet deployment. Initialize
   config once and record the program address, cluster, authority, and upgrade
   authority outside the repository.
4. Exercise wallet claim, permanent image/metadata upload, profile update,
   protocol tip, receipt verification, and indexer replay on that cluster.
5. Compare chain-derived totals with the disposable cache, run reconciliation,
   and test database deletion followed by a full backfill.
6. Obtain independent program/security review before enabling the flag for real
   users. No mainnet deployment is implied by a passing build.

## Indexer and rebuild

The cache is optional. A fresh deployment can rebuild it with:

```bash
TIPMARK_INDEXER_MODE=incremental bun run protocol:index
TIPMARK_INDEXER_MODE=backfill TIPMARK_INDEXER_PAGES=100 bun run protocol:index
bun run protocol:reconcile
```

The checkpoint is scoped by cluster and program. Incremental mode follows the
newest signature head; backfill mode walks older pages with a separate cursor.
Rows are keyed by canonical transaction signature and are written only after
`TipReceived` event, CPI transfer, signer, program, and success checks pass.
Set `TIPMARK_INDEXER_RESET=true` only when intentionally rebuilding the cache
from scratch. Keep the database migration and checkpoint backups until the
rebuild has been compared against RPC results.

## Incident response

- **RPC outage:** add a healthy same-cluster endpoint to
  `NEXT_PUBLIC_SOLANA_RPC_URLS`, restart server workers, and verify receipt
  lookups. Do not resend transactions whose signatures are unknown.
- **Metadata gateway outage:** preserve the on-chain URI/hash and try the next
  configured Arweave/IPFS gateway. Never replace metadata with a database row
  when a username PDA exists.
- **Indexer divergence:** stop scheduled indexing, run reconciliation, inspect
  the affected signatures, then resume from the checkpoint. If necessary reset
  and backfill; chain state remains authoritative.
- **Program vulnerability:** pause profile creation through the governed config
  authority, communicate the affected cluster, preserve signatures/logs, and
  follow the audited upgrade or migration policy. The tip instruction has no
  treasury or withdrawal path to drain.

## Upgrade authority and keys

The program upgrade authority and config authority must be held by a multisig
with a documented threshold and timelock during development. Deployment
keypairs, multisig signers, RPC credentials, Google secrets, Irys provider
configuration, and database credentials are operational secrets and must not
be committed or requested from users. Revoke upgrade authority only after an
independent audit, migration freeze, recovery drill, and published rollback
boundary.

## Data retention

PostgreSQL `User`, `Transaction`, `ProtocolTip`, and checkpoint rows are cache
or convenience state. The protocol profile PDA, username PDA, permanent
metadata object, and verified Solana transaction are authoritative. Deleting
the database must not change ownership, payout routing, public profile content,
or receipt validity.

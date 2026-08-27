# Decentralized Operations Runbook

## Clusters and endpoints

Keep `NEXT_PUBLIC_SOLANA_CLUSTER` explicit. Use `localnet` for program tests and
`devnet` for wallet and Irys rehearsal; those are the only accepted values, so
mainnet is a deliberate code change rather than an environment typo.
`NEXT_PUBLIC_SOLANA_RPC_URL` is the primary endpoint used by browser wallet
connections and writes. `NEXT_PUBLIC_SOLANA_RPC_URLS` is an ordered,
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
   protocol tip, and receipt verification on that cluster.
5. Confirm the creator ledger and public profile reproduce the same totals from
   a fresh process, with no local state carried over.
6. Obtain independent program/security review before opening the deployment to
   real users. No mainnet deployment is implied by a passing build.
7. Run `bun run protocol:release-check` with the devnet program address and
   public multisig metadata. The check must pass before any deployment change.

## Rebuilding a deployment

There is nothing to restore. A new deployment needs the program address, the
cluster, and an RPC endpoint; profiles, payout routing, and contribution history
are read from Solana and Arweave on first request. Verify a rebuild by opening a
known handle and its ledger and comparing the totals against the explorer.

## Incident response

- **RPC outage:** add a healthy same-cluster endpoint to
  `NEXT_PUBLIC_SOLANA_RPC_URLS`, restart server workers, and verify receipt
  lookups. Do not resend transactions whose signatures are unknown.
- **Metadata gateway outage:** preserve the on-chain URI/hash and try the next
  configured Arweave/IPFS gateway. A profile whose metadata cannot be fetched or
  whose hash does not match is unavailable, never substituted.
- **Program vulnerability:** pause profile creation through the governed config
  authority, communicate the affected cluster, preserve signatures/logs, and
  follow the audited upgrade or migration policy. The tip instruction has no
  treasury or withdrawal path to drain.

## Upgrade authority and keys

The program upgrade authority and config authority must be held by a multisig
with a documented threshold and timelock during development. This is now the
only meaningful centralisation left in the system: the deployment holds no
secrets, but a single upgrade key could replace the program under everyone.
Deployment keypairs and multisig signers are operational secrets and must never
be committed or requested from users. Revoke upgrade authority only after an
independent audit, migration freeze, recovery drill, and published rollback
boundary.

## Data retention

There is no application data to retain. The profile PDA, username PDA,
permanent metadata object, and confirmed Solana transactions are the entire
record, and none of them are ours to delete. Deleting or losing the deployment
cannot change ownership, payout routing, public profile content, or receipt
validity.

# Decentralized Release Security Checklist

## Program

- [x] Typed protocol, system, and upgradeable-loader accounts are validated.
- [x] Owner and signer relationships are enforced for profile, authority, and
      tip instructions.
- [x] Canonical profile and username PDA seeds and bumps are checked.
- [x] Prefunded empty system-owned PDAs are initialized safely; initialized or
      foreign-owned accounts are rejected.
- [x] The tip CPI uses the fixed system program and exact payout wallet.
- [x] Tip amount, profile activity, and self-tip invariants are enforced.
- [x] Authority transfer is two-step and profile creation has a pause control.
- [ ] Independent Anchor/Solana program audit.

## Client and indexer

- [x] Every wallet transaction is simulated before signing.
- [x] Signed writes never fail over to another RPC provider.
- [x] Receipt verification binds the instruction, event, transfer, signer,
      amount, reference, and profile PDA.
- [x] RPC reads retry transient failures and preserve provider consistency.
- [x] Index checkpoints use optimistic revisions and replay after cache deletion.
- [x] Permanent metadata is content-addressed and hash-verified.
- [ ] Independent client, metadata, and operational review.

## Release

- [x] Upgrade and protocol authority are documented as multisig responsibilities.
- [x] Release checks reject mainnet targeting, invalid addresses, duplicate
      signers, and one-person thresholds.
- [ ] Publish the multisig threshold, timelock, pause procedure, and rollback
      boundary for the selected deployment.
- [ ] Complete migration rehearsal and independent review before mainnet.

Run the automated gate with public keys only:

```bash
TIPMARK_RELEASE_CLUSTER=devnet \
TIPMARK_PROGRAM_ADDRESS=... \
TIPMARK_UPGRADE_AUTHORITY=... \
TIPMARK_MULTISIG_ADDRESS=... \
TIPMARK_MULTISIG_THRESHOLD=2 \
TIPMARK_MULTISIG_SIGNERS=..., ... \
bun run protocol:release-check
```

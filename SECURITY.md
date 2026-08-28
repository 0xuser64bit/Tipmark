# Security

## Scope

Tipmark is currently deployed to Solana **Devnet only**, and every protocol read
and write throws on `testnet` and `mainnet-beta`, so there are no real funds at
risk in this deployment. Reports are still wanted — the point of the devnet period
is to find these things now.

The parts worth attacking, in rough order of impact:

1. **The program** (`programs/tipmark_protocol`) — anything that lets a
   non-owner mutate a profile, redirects a tip away from the stored payout
   wallet, initializes a PDA that should be rejected, or makes the program hold a
   balance.
2. **The receipt verifier** (`lib/protocol/tip-receipt.ts`) — any transaction that
   verifies as a receipt without being one, or that verifies with the wrong
   supporter, payout wallet, amount, or profile.
3. **Handle resolution** (`lib/protocol/public-profile.ts`) — anything that makes a
   handle resolve to a profile that does not own it, or that accepts metadata
   whose hash does not match the profile account.
4. **Metadata** (`lib/protocol/metadata.ts`) — canonicalization ambiguity, where two
   different documents hash the same, or a document passes schema validation with
   a mutable URL.

## Reporting

Report privately through GitHub's **Report a vulnerability** flow on the
repository's Security tab. Do not open a public issue, and do not include a seed
phrase, private key, or RPC credential in the report — a signature, a program
log, or a failing test is enough.

Include the cluster, the program address, the signature or account addresses
involved, and the smallest reproduction you have.

## What the system guarantees

Stated so a report can be checked against it. Details in
[docs/architecture.md](docs/architecture.md).

- Every profile mutation requires the profile owner's signature. There is no
  server-side account, session, or database in the authorization path.
- The `tip` instruction transfers to the payout wallet stored in the profile
  account, via a typed System Program CPI. There is no treasury, fee account, or
  withdrawal instruction.
- The deployment holds no secrets. Every environment variable is a public value —
  a cluster name, a program address, an RPC endpoint, a domain, or a gateway list.
- Metadata is content-addressed and hash-verified; a mismatch makes a profile
  unavailable rather than substituted.
- Every protocol transaction is simulated before a signature is requested. The
  one wallet-signed transaction that is not is the Irys funding transfer, which
  the upload client builds.
- Signed writes never fail over to another RPC provider.
- RPC responses and gateway data are treated as untrusted input.

## Known limitations

These are accepted and documented, not vulnerabilities:

- **A single upgrade authority.** Until it is a multisig with a published
  threshold and timelock, one key can replace the program. This is the largest
  centralization in the system and a precondition for mainnet.
- **No independent audit yet.** Neither the program nor the client has had one.
- **Wallet loss is unrecoverable.** There is no recovery path by design; the
  wallet is the identity.
- **The RPC URL is public.** It is served to the browser. Use a domain-restricted
  key.
- **Permanent storage is append-only.** Superseded metadata objects stay
  addressable and cannot be deleted.

# Contributing

## Setup

Bun is required for the app. Rust, Anchor, and the Solana CLI are needed only to
change the on-chain program.

```bash
bun install
cp .env.example .env   # fill in NEXT_PUBLIC_SOLANA_RPC_URL
bun run dev
```

Rust 1.89.0 (`rust-toolchain.toml`) and Anchor 1.0.1 (`Anchor.toml`) are pinned.
Bun is pinned in CI only (1.4.0); use that version locally. Never commit `.env`,
a wallet keypair, or an RPC credential.

## Checks

Run before opening a pull request. CI runs the same set plus a build and a check
that the committed IDL and client match a fresh regeneration.

```bash
bun run format        # prettier --write  (format:check in CI)
bun run lint
bun run typecheck
bun test
bun run protocol:test # Rust tests, clippy, then the TypeScript suite
```

`clients/`, `idls/`, and `target/` are excluded from Prettier: Codama and Anchor
format their own output, and reformatting it produces a diff that the next
`protocol:generate` reverts. Regenerate rather than hand-editing anything there.

## Changing the program

`programs/tipmark_protocol` is the source of truth. The IDL and the TypeScript
client are derived from it and both are committed, so a program change is always
at least three files.

```bash
bun run protocol:build      # anchor build + normalize IDL + copy to idls/
bun run protocol:generate   # regenerate clients/tipmark-protocol from the IDL
bun run protocol:test
bun run protocol:integration
```

`protocol:build` uses `--ignore-keys` so the committed program ID stays
reproducible without a deployment keypair in the tree. `scripts/normalize-protocol-idl.mjs`
injects the `UsernameRecord` account, which Anchor omits because it only ever
appears as an `UncheckedAccount`.

Two rules that are easy to break:

- **Validation is duplicated on purpose.** The username grammar exists in
  `programs/tipmark_protocol/src/validation.rs` and in
  `lib/protocol/username.ts`, and account sizes are asserted in
  `lib/protocol/public-profile.ts`. Change one, change the other. The two
  username test files share a fixture list on purpose — keep them identical.
- **Never widen the receipt verifier.** `lib/protocol/tip-receipt.ts` is what
  makes a receipt mean something. If a real transaction fails verification, the
  fix is usually elsewhere.

## Testing

### Localnet integration test

```bash
bun run protocol:integration
```

Builds the program, starts a disposable `solana-test-validator` on a private
port, deploys, initializes the config PDA, then creates a profile, updates it,
sends a tip, verifies the receipt, and scans the profile's signatures to confirm
the creator's statement contains exactly that tip for exactly that amount. The
scan step is the one that proves the architecture: it uses the same code path the
statement does, from a process holding no state. Keypairs and the ledger are
temporary and are removed afterwards.

### Devnet browser rehearsal

The localnet test cannot cover wallet UX or Irys, because permanent uploads are
devnet-only. For that, point a dev server at devnet:

```env
NEXT_PUBLIC_SOLANA_CLUSTER="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_TIPMARK_PROGRAM_ID="<deployed-devnet-program-address>"
```

The program must already be deployed and its config PDA initialized on that
cluster. Restart Next.js after any change — public variables are inlined when the
bundle is compiled.

Creator pass: open `/`, start a page, connect a devnet wallet, choose a handle,
enter a display name and payout wallet, optionally upload images (Irys charges the
connected wallet in devnet SOL), publish, then confirm `/<handle>` resolves from
the PDAs plus hash-verified metadata and that `/ledger` and `/me` fall back to
the connect prompt once disconnected.

Supporter pass: open the handle in a second browser profile with a different
wallet, send a small tip, confirm the payout wallet receives the lamports
directly, open the receipt route and check that every field is derived from the
transaction, then refresh `/ledger` and confirm the tip appears with the same
amount.

Use a fresh browser profile so the run starts from a genuinely new creator.

### Safety boundaries

- Never point the app at `testnet` or `mainnet-beta`. Every protocol read and
  write throws on those clusters, and it should stay that way.
- Never use a mainnet-funded wallet for devnet testing.
- Never paste a seed phrase or private key into the app, the repository, or a
  chat with a tool.
- Never resend an ambiguous signed transaction — look its signature up first.
- A passing localnet test is not an audit and not a mainnet release approval.

## Conventions

- Commits are conventional and scoped: `feat(payments):`, `fix(receipts):`,
  `refactor(state):`, `docs(ops):`.
- Comments explain _why_, not what. If a comment restates the line below it,
  delete it.
- One source of truth per subject. Prefer editing an existing document over
  adding one; if a topic already has a home in `docs/`, put it there.

## Security

Do not open a public issue for a vulnerability in the program, the receipt
verifier, or the metadata path. See [SECURITY.md](SECURITY.md).

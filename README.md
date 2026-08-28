# Tipmark

A non-custodial creator support page on Solana. A creator claims a link, shares
it, and supporters send SOL straight from their wallet to the creator's. There
is no platform cut, no custody, and every contribution has a receipt that can be
rebuilt from the chain.

There is also no database, no login, and no upload provider. Ownership lives in a
Solana program, profile content lives on Arweave, and the connected wallet is the
only identity. Delete this deployment and every page, payout route, and receipt
is still intact and still verifiable.

> **Devnet only.** The program is deployed to Solana Devnet. Configuring
> `testnet` or `mainnet-beta` makes every profile read and every transaction
> throw, so mainnet is unreachable without a code change. Do not use a
> mainnet-funded wallet with it.

## How it works

```
claim a handle ─▶ username PDA + profile PDA          (Solana, wallet-signed)
                  profile metadata + images           (Arweave via Irys)
supporter tips ─▶ tip instruction ─▶ System transfer  (supporter ─▶ payout wallet)
                  TipReceived event
read a page    ─▶ PDAs + hash-verified metadata       (no database)
read a ledger  ─▶ signature scan ─▶ verified receipts (recomputed, never stored)
```

Three properties fall out of that and are worth stating plainly, because they are
what the code is organised around:

- **The program never holds a balance.** `tip` validates the payout account
  against the profile, then CPIs to the System Program. There is no treasury, no
  fee account, and no withdrawal instruction to drain.
- **Totals are recomputed, never stored.** A creator's ledger is derived from
  verified `TipReceived` events, scanned from chain and held for 30 seconds. This
  is slower than an index and is the intended trade: no derived total can drift
  from the chain.
- **The deployment holds no secrets.** Every environment variable is a public
  value — a cluster name, a program address, an RPC endpoint, a domain, or a
  gateway list.

## Stack

| Layer        | Choice                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| App          | Next.js 15 App Router, React 18, TypeScript                                                            |
| Styling      | Tailwind CSS v4 (CSS-first `@theme`), Radix primitives                                                 |
| Chain reads  | `@solana/kit` for accounts, `@solana/web3.js` for signature scans, both with ordered endpoint failover |
| Chain writes | `@solana/web3.js` + Wallet Adapter, simulated before signing                                           |
| Program      | Anchor 1.0.1 (Rust), client generated with Codama                                                      |
| Storage      | Arweave via Irys, funded and signed by the creator's wallet                                            |
| Identity     | The connected wallet. No accounts, no sessions, no database                                            |
| Tooling      | Bun (package manager and test runner)                                                                  |

## Running it

Requires [Bun](https://bun.sh) and a Solana wallet extension with Devnet SOL.
Rust, Anchor, and the Solana CLI are needed only to work on the program itself —
see [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
bun install
cp .env.example .env   # fill in NEXT_PUBLIC_SOLANA_RPC_URL
bun run dev
```

There is no database to provision and no migration to run.

### Configuration

Every variable is public. Browser bundles inline them at build time, so
**redeploy after changing any of them**. Every one also has a fallback — the
committed program address, the public Devnet RPC, `devnet` as the cluster — so the
app starts with an empty `.env`. Those defaults are fine for a first look and
wrong for a deployment: the public RPC is rate-limited, and it reaches the
browser.

| Variable                           | Set it for               | Notes                                                                                                                                         |
| ---------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SOLANA_RPC_URL`       | any real deployment      | A Devnet HTTPS endpoint. Prefer a domain-restricted key — this URL reaches the browser. Defaults to the public Devnet endpoint.               |
| `NEXT_PUBLIC_TIPMARK_PROGRAM_ID`   | a deployment of your own | Must match `Anchor.toml` and `idls/tipmark_protocol.json`, and its config PDA must already be initialized. Defaults to the committed address. |
| `NEXT_PUBLIC_SOLANA_CLUSTER`       | localnet work            | `devnet` or `localnet`. `testnet` and `mainnet-beta` throw; an unrecognized value falls back to `devnet`. Defaults to `devnet`.               |
| `NEXT_PUBLIC_SOLANA_RPC_URLS`      | read failover            | Extra same-cluster endpoints, comma-separated. Tried in order for reads. Writes never fail over.                                              |
| `NEXT_PUBLIC_BRAND_DOMAIN`         | your own domain          | Without `https://`. Used for canonical links and share cards.                                                                                 |
| `NEXT_PUBLIC_ARWEAVE_GATEWAY_URLS` | overriding gateways      | Comma-separated. Devnet Irys uploads never settle to Arweave, so off mainnet an Irys node is tried first regardless of order.                 |
| `NEXT_PUBLIC_IPFS_GATEWAY_URLS`    | overriding gateways      | Comma-separated fallback gateways.                                                                                                            |

The `TIPMARK_*` variables in `.env.example` are consumed only by
`bun run protocol:release-check`, never by the running app. They are public
addresses and published governance metadata — never a private key.

## Layout

```
app/                 Routes. /[username] is the public page, /ledger the statement
components/          UI. components/ui/* are the design-system primitives
actions/             Server actions — chain and price reads, no writes
lib/protocol/        PDAs, metadata hashing, receipt verification, earnings, uploads
lib/solana/          Cluster config, RPC read failover, lamport arithmetic
programs/            The Anchor program (Rust)
clients/             Generated protocol client — do not edit by hand
idls/                Committed program IDL
scripts/             Codegen, localnet smoke test, release gate
```

The design system lives in `app/globals.css` (tokens and utilities) and
`components/ui/*`. The recurring structural element is the ledger row — a
label/value line separated by a hairline — which appears on the support panel and
the receipt.

## Development

```bash
bun run dev          # dev server
bun run typecheck    # tsc --noEmit
bun run lint         # eslint
bun run format       # prettier --write
bun test             # unit tests
```

Program work, the localnet integration test, and the devnet rehearsal are
documented in [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) — setup, checks, program changes, testing
- [SECURITY.md](SECURITY.md) — threat model, invariants, reporting
- [docs/architecture.md](docs/architecture.md) — data model, verification, trade-offs
- [docs/operations.md](docs/operations.md) — release gates, incident response, key custody

## License

MIT — see [LICENSE](LICENSE).

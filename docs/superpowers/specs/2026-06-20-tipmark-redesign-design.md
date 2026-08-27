# Tipmark Redesign — Design Spec

**Date:** 2026-06-20
**Status:** Approved direction, pending spec review

## 1. Product context

Tipmark is a **crypto-native creator support page** on Solana. The core loop:

- A **creator** signs in (Google), claims `tipmark-platform.vercel.app/<username>`, fills a profile, shares the link.
- A **supporter** lands on the public page, connects a Solana wallet, sends SOL **wallet-to-wallet** (non-custodial, no middleman).
- The creator tracks earnings in a dashboard and shares a downloadable QR "card".

**Value prop:** money goes directly to the creator, transparently, with near-zero fees, verifiable on-chain.
**Two users the current UI fails to distinguish:** the _creator_ (wants to look legit + track earnings) and the _supporter_ (wants to tip in 3 clicks and trust it worked).

## 2. Audit summary (why redesign)

Bones are solid (Next App Router, server actions, Prisma, sensible flow). The experience undersells it:

1. Generic "dark zinc SaaS template"; no ownable brand identity.
2. Animation overload (particles, glitch, typewriter, magnetic, 3D-tilt, floating icons) doing the job design should do — reads busy, not premium.
3. The shadcn token system in `globals.css` is defined but unused; components hardcode `zinc-*`; `.dark` class never applied.
4. The money moment (support card) is tiny and trust-poor; USD is `"$$$"` placeholder; dashboard ships `"+XXX since last hour"`.
5. Onboarding is an 11-field wall (4 socials forced to `#`); `/home` redirects unless all fields filled.
6. Inconsistent identity: "Tipmark" plain text styled 3 different ways; no logo; dashboard has bespoke nav.
7. Trust gaps for a finance product: rate-limited public RPC, kitten-gif success page, raw-SVG 404.
8. **Bug:** `getEarningData` mutates a module-level `monthlyEarningData` array → earnings bleed across requests/users.

**Keep:** wallet-to-wallet flow, QR share-card, Prisma schema, server-action structure, Recharts, copy/share mechanic.

## 3. Decisions (locked with user)

- **Visual identity:** Solana-native neon. Near-black canvas, purple = brand/action, green = money/confirmed, signature purple→green gradient used **sparingly**, mono numerals for money.
- **Dependency scope:** Upgrade design layer only — Tailwind 3→4, `framer-motion`→`motion`. Hold React 18 / Next 15.2 / NextAuth v5 to protect wallet + auth.
- **Depth:** All four flows (money moment, onboarding, landing, dashboard) + global states.
- **Theme:** Dark-only, done impeccably (app + public pages).
- **Socials:** Keep X / Instagram / GitHub / LinkedIn, make **optional**, hide when empty. No schema change.

## 4. Design system

### Tokens (Tailwind v4 `@theme`, dark-first, in `app/globals.css`)

| Token               | Value                                     | Use                        |
| ------------------- | ----------------------------------------- | -------------------------- |
| `--color-canvas`    | `#0A0A0F` near-black                      | app background             |
| `--color-surface`   | `#141419`                                 | cards                      |
| `--color-surface-2` | `#1C1C23`                                 | elevated                   |
| `--color-border`    | `rgba(255,255,255,0.08)`                  | hairlines                  |
| `--color-brand`     | `#9945FF` Solana purple                   | CTA, brand, focus ring     |
| `--color-money`     | `#14F195` Solana green                    | amounts, confirmed, "live" |
| `--color-fg`        | `#FAFAFA`                                 | text                       |
| `--color-muted`     | `#A1A1AA` zinc-400                        | secondary text             |
| gradient            | `linear-gradient(135deg,#9945FF,#14F195)` | sparing accents            |

Map shadcn aliases (`--background`, `--card`, `--primary`, `--ring`, etc.) onto these so existing shadcn components inherit the theme.

### Typography

- **Geist Sans** (local, `app/fonts/GeistVF.woff`) → UI/display. Drop `Sour_Gummy`.
- **Geist Mono** (local, `app/fonts/GeistMonoVF.woff`) → SOL amounts, addresses, signatures, stats (`font-mono` + `tabular-nums`).

### Motion philosophy

Calm. Remove glitch/typewriter/particles/magnetic/3D-tilt/floating-icons. Keep: gentle fade/slide on mount, **count-up** for money, one tasteful **success confetti**, subtle hover lift. All gated by `prefers-reduced-motion`. Use `motion` (`motion/react`).

## 5. Shared components

- `Logo` — wordmark + small gradient mark (inline SVG component).
- `Navbar` / `AppShell` — single persistent nav for authed pages (replaces 3 bespoke headers + dashboard nav).
- `Footer` — unified (replaces `footer.tsx` + `LandingFooter.tsx`).
- `Button` — extend shadcn with `brand` (gradient), `accent`, refined `outline`/`ghost`.
- `Card` — surface tokens, consistent radius/border.
- Money primitives:
  - `SolAmount` — renders SOL (mono, tabular) + live USD via `getSolPrice`.
  - `AddressChip` — truncated mono address with copy.
  - `StatusBadge` — confirmed / processing / finalized.
  - `StatCard` — label, value (count-up), sublabel.
- `EmptyState`, branded skeletons, restyled `sonner` Toaster.

## 6. Pages

- **Landing `/`** — Remove particles/glitch/fake testimonial. Hero ("Get paid in crypto. Keep all of it."), value line, primary CTA + inline `tipmark-platform.vercel.app/<claim>` input. Show the real product (profile + QR card, gentle float). 3-step "How it works". Trust band (Non-custodial · Wallet-to-wallet · Verifiable on Solana). Clean footer.
- **Onboarding `/edit-profile`** — Guided wizard + **live profile preview**: ① claim handle (real-time availability via existing 409 path) + name → ② avatar/cover/bio (markdown edit/preview retained) → ③ wallet + **optional** socials → ④ "You're live 🎉" share. Relax `/home` gate to require only handle + name + wallet.
- **Money moment `/[username]` (+ authed `/home` self-view)** — Preset amounts with **live USD**, custom amount with USD, "Sending to: `<AddressChip>`" trust line, graceful wallet-connect state, confident CTA, light social proof ("N people supported"). Responsive: single column on mobile, support panel prominent.
- **Success `/check-explorer/[signature]`** — Branded receipt: green check + tasteful confetti, amount SOL+USD, recipient, signature `AddressChip`, "View on Solscan", growth-loop CTA "Create your own page".
- **Dashboard `/dashboard`** — `AppShell`. Real stats (SOL **+ USD**, supporters, count-up). Brand-restyled Recharts. Transactions list (address chip · amount · status · explorer link). Real empty state. Share tools.
- **Global** — branded 404, restyled skeletons + toasts.

## 7. Technical changes

- **Tailwind v4:** `@tailwindcss/postcss` in `postcss.config.mjs`; `@import "tailwindcss"` + `@theme` in `globals.css`; delete color mapping from `tailwind.config.ts` (keep minimal or remove). Add `tw-animate-css` (v4 successor) so shadcn dialog/dropdown enter/exit animations keep working. Drop unused `tailwind-gradient-mask-image`. Define a small `bg-grid` utility (used by `user-card`).
- **Motion:** swap all `framer-motion` imports → `motion/react`. Centralize variants in a `lib/motion.ts` with reduced-motion support.
- **Fonts:** `next/font/local` for Geist Sans + Mono in `app/layout.tsx`; CSS vars `--font-sans`, `--font-mono`.
- **RPC:** `wallet-adapter-wrapper` reads `NEXT_PUBLIC_SOLANA_RPC_URL` (fallback `clusterApiUrl(Mainnet)`). Document in `.env.example`.
- **SOL price:** new `actions/getSolPrice` (server, cached ~60s, public price API, graceful fallback). Consumed by `SolAmount`.
- **Bug fix:** `getEarningData` builds `monthlyEarningData` per-request (no module-level mutation); bucket by month within the last 12 months.
- **Dep cleanup (post-redesign):** remove `three`, `react-spring` (never imported); remove `tsparticles`/`@tsparticles/*` after deleting particle components; remove the `animated-*`/`enhanced-*`/`particles-*`/`text-reveal`/`floating-icons`/`scroll-animations` components that are no longer used.
- Keep: `html2canvas` (card download), `recharts`, `qrcode.react`, `react-markdown`, `react-loading-skeleton`, `sonner`, `next-auth` v5, `@prisma/*`, all `@solana/*`.

## 8. Implementation phases

1. **Foundation** — Tailwind v4 migration, fonts, token system, `lib/motion.ts`, `Logo`. Verify dev build renders.
2. **Primitives** — `Navbar`/`AppShell`, `Footer`, `Button`/`Card` brand variants, money primitives, `getSolPrice`, `EmptyState`, skeletons, Toaster.
3. **Money moment** — `/[username]` + support flow + success receipt.
4. **Onboarding** — wizard + live preview; relax `/home` gate; optional socials.
5. **Landing** — new hero + sections.
6. **Dashboard** — stats + chart + transactions + empty states; fix earnings bug.
7. **Global + cleanup** — 404, remaining states, remove dead deps/components, `.env.example`/README touch-ups.
8. **Verify** — `next build`, typecheck, lint; fix; manual-verify checklist for the user.

## 9. Out of scope (YAGNI)

- Light mode. React 19 / Next 16. Migration to `@solana/kit`. New socials/schema changes. Withdrawal/off-ramp features. Multi-chain. Auth providers beyond Google.

## 10. Risks & verification

- Tailwind v4 migration can break shadcn animations → mitigated by `tw-animate-css` + verifying dialog/dropdown.
- Public price API may rate-limit → cache + graceful fallback (hide USD rather than error).
- Wallet/auth must remain functional → no framework upgrade; manual-verify connect + send + dashboard.
- `next build` requires env (DATABASE_URL etc.) → verify locally; note any env-dependent steps to the user.

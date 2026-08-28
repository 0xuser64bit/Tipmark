import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND_DOMAIN, BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: "How it works",
  description: `What ${BRAND_NAME} does, what it does not do, what it costs, and what happens to your money. Written plainly.`,
};

const SECTIONS = [
  {
    id: "what",
    heading: "What this is",
    body: [
      `${BRAND_NAME} gives you a page at ${BRAND_DOMAIN}/your-handle. Someone opens it, connects a Solana wallet, chooses an amount and approves a transfer. The SOL goes from their wallet to the address you entered. That is the entire mechanism.`,
      "There is no balance held on your behalf, no payout schedule and no withdrawal step, because there is never a moment when the money is ours.",
    ],
  },
  {
    id: "money",
    heading: "Where the money goes",
    body: [
      "Straight to the Solana address in your page's on-chain record. That record lives in a Solana program account your wallet owns, not in a database of ours. We never see a private key, never hold a balance, and could not move your funds if we wanted to.",
      "The flip side is that we cannot recover anything either. If you lose access to that wallet, the contributions in it are gone, and so is the ability to edit your page. Use a wallet you control and have backed up.",
    ],
  },
  {
    id: "fees",
    heading: "What it costs",
    body: [
      `${BRAND_NAME} takes nothing. There is no subscription, no percentage and no per-transaction charge.`,
      "Solana charges a network fee of roughly 0.000005 SOL — a fraction of a cent — and the sender pays it. So a contribution of 1 SOL arrives as 1 SOL.",
      "The honest caveat: we are not charging you today. If that ever changes it will be announced before it applies, never retroactively, and your page keeps working either way because the money was never routed through us.",
    ],
  },
  {
    id: "receipts",
    heading: "Receipts and proof",
    body: [
      "Every contribution produces a transaction signature. Your ledger lists them, and each one links to Solscan where anyone can confirm the amount, the sender, the recipient and the time.",
      "This matters for two reasons. If you run a project funded by supporters, you can prove what came in without asking anyone to trust your word. And a supporter never has to take our word that their money arrived.",
    ],
  },
  {
    id: "limits",
    heading: "What it is not good at",
    body: [
      "Your supporters need a Solana wallet. For an audience already in crypto that is nothing; for a general audience it is a real barrier and the main reason to keep a card-based option alongside this one.",
      "Contributions arrive in SOL, whose price moves. If you need predictable income in your local currency, convert as it comes in.",
      "Transfers are final. There are no chargebacks and no refunds — that is precisely why the fee is near zero, and it is also why a mistyped amount stays mistyped.",
      "There are no memberships, tiers, paywalls or subscriptions. This is a tip jar. If you need recurring billing and gated content, use something built for that.",
    ],
  },
  {
    id: "data",
    heading: "What we know about you",
    body: [
      "Nothing you have not published. There is no sign-up, no password and no email address, because there is no account — connecting your wallet is how you prove the page is yours. We have no database, so there is nowhere for us to keep anything.",
      "Your handle, display name, bio, images and payout address are written to Solana and to permanent public storage by your own wallet. That is a deliberate trade: it is what makes the page outlive us, and it also means those fields are public and cannot be unpublished.",
      "Contributions are recorded by Solana, not by us. Your ledger is recomputed from the chain each time you open it, so the amounts, signatures, sender addresses and times you see there are the same ones anyone else can read.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        width="text"
        actions={
          <Button asChild variant="primary" size="sm">
            <Link href="/">Start a page</Link>
          </Button>
        }
      />

      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 sm:px-8">
        <header className="border-b border-rule py-14 sm:py-20">
          <p className="field-label">{BRAND_NAME}</p>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(2.1rem,5.5vw,3.25rem)] font-medium leading-[1.02]">
            How this works, in plain terms.
          </h1>
          <p className="mt-6 max-w-[54ch] font-serif text-[18px] leading-relaxed text-ink-soft">
            A crypto product that explains itself badly is asking to be
            distrusted. So: what it does, what it costs, where your money goes,
            and the four things it is bad at.
          </p>
        </header>

        {/* Contents — useful on a page this long. */}
        <nav aria-label="Contents" className="border-b border-rule py-6">
          <p className="field-label">Contents</p>
          <ol className="mt-3 space-y-1.5">
            {SECTIONS.map(({ id, heading }, i) => (
              <li key={id} className="flex gap-3 text-[13.5px]">
                <span className="figure text-ink-ghost">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <a
                  href={`#${id}`}
                  className="text-ink-soft underline decoration-rule-strong decoration-1 underline-offset-[3px] transition-colors hover:text-ink hover:decoration-ink-faint"
                >
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="divide-y divide-rule">
          {SECTIONS.map(({ id, heading, body }, i) => (
            <section key={id} id={id} className="scroll-mt-8 py-10 sm:py-12">
              <div className="flex items-baseline gap-3">
                <span className="figure text-[13px] text-ink-ghost">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-[clamp(1.35rem,2.8vw,1.75rem)] font-medium">
                  {heading}
                </h2>
              </div>
              <div className="prose-ledger mt-5 pl-0 sm:pl-[calc(0.75rem+2ch)]">
                {body.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="flex flex-col items-start gap-5 border-t border-rule py-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[30ch] font-serif text-[21px] leading-snug">
            Still sounds like the right trade?
          </p>
          <Button asChild variant="primary" size="lg">
            <Link href="/">Claim your link</Link>
          </Button>
        </section>
      </main>

      <SiteFooter width="text" />
    </div>
  );
}

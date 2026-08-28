import Link from "next/link";
import { ArrowUpRight, Pencil } from "lucide-react";
import type { EarningSummary } from "@/actions/getEarningData";
import { CopyLink } from "./copy-link";
import { MonthStrip } from "./month-strip";
import { ShareCardDialog } from "./share-card-dialog";
import { Button } from "./ui/button";
import { Hash } from "./ui/hash";
import { Money } from "./ui/money";
import { Panel, PanelHeader, PanelTitle } from "./ui/panel";
import { Stamp, isSettled } from "./ui/stamp";
import { formatUsd } from "@/lib/format";
import { getSolscanTransactionUrl } from "@/lib/solana/cluster";
import { cn } from "@/lib/utils";
import { profileUrl } from "@/lib/brand";

/**
 * The creator's statement.
 *
 * Not a dashboard of KPI cards. One headline figure — what you have been
 * given — then a strip of supporting figures, twelve months of history at
 * the size of a data mark, and the full ledger of contributions as an
 * actual table you can read down.
 */
export function Statement({
  data,
  priceUsd,
  username,
  displayName,
  profileImage,
}: {
  data: EarningSummary;
  priceUsd: number | null;
  username: string | null;
  displayName: string;
  profileImage: string;
}) {
  const url = username ? profileUrl(username) : null;

  /* A statement of nothing is four zeros and a flat chart — an accurate
     but useless screen, and the one almost every new creator sees first.
     Until something arrives, this page has a different job. */
  if (data.contributions === 0) {
    return (
      <FirstRun
        url={url}
        username={username}
        displayName={displayName}
        profileImage={profileImage}
      />
    );
  }

  return (
    <main id="main" className="mx-auto max-w-[1120px] px-5 pb-24 sm:px-8">
      {/* ── Masthead ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-rule py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="field-label">Total received</p>
          <div className="mt-3">
            <Money
              sol={data.total}
              priceUsd={priceUsd}
              size="display"
              fiat="below"
            />
          </div>
        </div>

        {url && (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <CopyLink url={url} size="sm" />
            <Button asChild variant="outline" size="sm">
              <Link href={`/${username}`}>
                View as public
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── Supporting figures ───────────────────────────────────────── */}
      {/* Two up on a phone, four across on a desk. Separators are computed
          from position so a wrapped row never inherits a dangling rule. */}
      <dl className="grid grid-cols-2 border-b border-rule sm:grid-cols-4">
        {[
          {
            label: "Last 7 days",
            body: (
              <Money
                sol={data.last7}
                priceUsd={priceUsd}
                size="lg"
                fiat="below"
              />
            ),
          },
          {
            label: "Last 30 days",
            body: (
              <Money
                sol={data.last30}
                priceUsd={priceUsd}
                size="lg"
                fiat="below"
              />
            ),
          },
          {
            label: "Supporters",
            body: (
              <>
                <span className="figure text-[21px] font-medium tracking-[-0.03em] text-ink">
                  {data.supporters}
                </span>
                <span className="figure mt-0.5 block text-[12px] text-ink-faint">
                  {data.contributions}{" "}
                  {data.contributions === 1 ? "contribution" : "contributions"}
                </span>
              </>
            ),
          },
          {
            label: "Largest",
            body: (
              <Money
                sol={data.largest}
                priceUsd={priceUsd}
                size="lg"
                fiat="below"
              />
            ),
          },
        ].map(({ label, body }, i) => (
          <div
            key={label}
            className={cn(
              "py-5 pr-4",
              i % 2 === 1 && "border-l border-rule pl-5",
              i >= 2 && "border-t border-rule sm:border-t-0",
              "sm:border-l sm:border-rule sm:pl-5 sm:first:border-l-0 sm:first:pl-0",
            )}
          >
            <dt className="field-label">{label}</dt>
            <dd className="mt-2.5">{body}</dd>
          </div>
        ))}
      </dl>

      {priceUsd != null && (
        <p className="figure mt-3 text-[11px] text-ink-ghost">
          Fiat shown at {formatUsd(priceUsd)} / SOL, refreshed each minute.
        </p>
      )}

      {/* ── History + ledger ─────────────────────────────────────────── */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <div className="min-w-0 lg:order-2 lg:sticky lg:top-8 lg:self-start">
          <MonthStrip months={data.months} />

          {url && (
            <div className="mt-10 border-t border-rule pt-6">
              <p className="field-label">Share your page</p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-ink-faint">
                Most contributions come from a link in a bio or the end of a
                video.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ShareCardDialog
                  name={displayName}
                  username={username!}
                  profileUrl={url}
                  imageUrl={profileImage}
                />
                <Button asChild variant="quiet" size="sm">
                  <Link href="/edit-profile">
                    <Pencil aria-hidden />
                    Edit page
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <Panel className="min-w-0 lg:order-1">
          <PanelHeader>
            <PanelTitle>Contributions</PanelTitle>
            <span className="figure text-[11.5px] text-ink-faint">
              {data.contributions}
            </span>
          </PanelHeader>

          <>
            {/* Wide: a real table you can read down a column.
                  Narrow: one block per contribution. A horizontally
                  scrolling table would put the amount — the only figure
                  anyone opens this for — off the edge of the screen. */}
            <table className="hidden w-full border-collapse text-left sm:table">
              <thead>
                <tr className="border-b border-rule">
                  <Th>Date</Th>
                  <Th>From</Th>
                  <Th>Status</Th>
                  <Th align="right">Amount · SOL</Th>
                  <Th align="right">
                    <span className="sr-only">Receipt</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr
                    key={row.hash}
                    className="border-b border-rule transition-colors last:border-0 hover:bg-well/60"
                  >
                    <Td>
                      <span className="figure whitespace-nowrap text-[12.5px] text-ink-soft">
                        {formatDay(row.createdAt)}
                      </span>
                    </Td>
                    <Td>
                      <Hash value={row.fromPublicKey} label="sender address" />
                    </Td>
                    <Td>
                      <Stamp status={row.status} />
                    </Td>
                    <Td align="right">
                      <Money sol={row.amount} sign="+" size="sm" unit={false} />
                    </Td>
                    <Td align="right">
                      <SolscanLink hash={row.hash} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="sm:hidden">
              {data.rows.map((row) => (
                <li
                  key={row.hash}
                  className="flex items-start gap-3 border-b border-rule px-4 py-3.5 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="figure shrink-0 text-[12.5px] text-ink-soft">
                        {formatDay(row.createdAt)}
                      </span>
                      <Hash value={row.fromPublicKey} label="sender address" />
                    </div>
                    {!isSettled(row.status) && (
                      <div className="mt-2">
                        <Stamp status={row.status} />
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Money sol={row.amount} sign="+" size="sm" />
                    <SolscanLink hash={row.hash} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        </Panel>
      </div>
    </main>
  );
}

function formatDay(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function SolscanLink({ hash }: { hash: string }) {
  return (
    <a
      href={getSolscanTransactionUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex size-6 items-center justify-center rounded-[3px] text-ink-ghost transition-colors hover:bg-well-deep hover:text-ink"
      aria-label="Open this transaction on Solscan"
    >
      <ArrowUpRight className="size-[14px]" aria-hidden />
    </a>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "field-label px-4 py-2.5",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </td>
  );
}

/* ── First run ──────────────────────────────────────────────────────── */

const PLACES = [
  {
    n: "01",
    title: "The link in your bio",
    body: "Every profile you have. It is the single highest-converting place, and it costs nothing to keep there forever.",
  },
  {
    n: "02",
    title: "The end of a video",
    body: "Say it out loud once and put the QR card in the last frame. People screenshot those.",
  },
  {
    n: "03",
    title: "Where you already ask",
    body: "A pinned post, a newsletter footer, a README, a stream overlay. Anywhere you would have put a coffee link.",
  },
];

/**
 * What a creator sees before their first contribution.
 *
 * The statement is replaced entirely: the useful information at this point
 * is the link itself and where to put it, not four zeros and an empty chart.
 */
function FirstRun({
  url,
  username,
  displayName,
  profileImage,
}: {
  url: string | null;
  username: string | null;
  displayName: string;
  profileImage: string;
}) {
  if (!url || !username) {
    return (
      <main
        id="main"
        className="mx-auto max-w-[1120px] flex-1 px-5 py-20 sm:px-8"
      >
        <h1 className="max-w-[24ch] text-[clamp(1.9rem,4.4vw,2.6rem)] font-medium">
          Your page isn&rsquo;t live yet.
        </h1>
        <p className="mt-4 max-w-[52ch] text-[14px] leading-relaxed text-ink-faint">
          It needs a handle, a name and a Solana address before anyone can send
          you anything. That is the whole setup.
        </p>
        <Button asChild variant="primary" className="mt-7">
          <Link href="/edit-profile">Finish setting up</Link>
        </Button>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-[1120px] px-5 pb-24 sm:px-8">
      <div className="border-b border-rule py-12 sm:py-16">
        <p className="field-label">Live</p>
        <h1 className="mt-4 max-w-[22ch] text-[clamp(1.9rem,4.6vw,2.75rem)] font-medium">
          Your page is ready. Now it needs an audience.
        </h1>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <CopyLink url={url} />
          <Button asChild variant="outline">
            <Link href={`/${username}`}>
              View it
              <ArrowUpRight aria-hidden />
            </Link>
          </Button>
        </div>

        <p className="mt-6 max-w-[56ch] text-[14px] leading-relaxed text-ink-faint">
          Nothing has arrived yet. When someone does send SOL, it reaches your
          wallet in about a second and shows up here as a receipt — amount,
          sender, signature — that either of you can check on Solana.
        </p>
      </div>

      <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="field-label">Where to put it</p>
          <h2 className="mt-3.5 max-w-[18ch] text-[clamp(1.5rem,3vw,2rem)] font-medium">
            Three places that actually work.
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            <ShareCardDialog
              name={displayName}
              username={username}
              profileUrl={url}
              imageUrl={profileImage}
            />
            <Button asChild variant="quiet" size="sm">
              <Link href="/edit-profile">
                <Pencil aria-hidden />
                Edit page
              </Link>
            </Button>
          </div>
        </div>

        <ol className="border-t border-rule">
          {PLACES.map(({ n, title, body }) => (
            <li
              key={n}
              className="grid gap-x-5 gap-y-1.5 border-b border-rule py-6 sm:grid-cols-[2.5rem_minmax(0,1fr)]"
            >
              <span className="figure pt-0.5 text-[13px] text-ink-ghost">
                {n}
              </span>
              <div>
                <h3 className="font-sans text-[15px] font-semibold tracking-[-0.005em]">
                  {title}
                </h3>
                <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-faint">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

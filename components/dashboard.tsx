"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { CountUp } from "@/components/ui/count-up";
import { AddressChip } from "@/components/ui/address-chip";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/format";
import { motion } from "motion/react";
import { useInView } from "react-intersection-observer";
import {
  ArrowUpRight,
  Calendar,
  Coins,
  Inbox,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface DashboardProps {
  totalEarning: number;
  last30daysEarning: number;
  last7daysEarning: number;
  totalTransactions: number;
  uniqueSupporters: number;
  recentTransactions: {
    hash: string;
    amount: string;
    fromPublicKey: string;
    createdAt: Date;
    status: string;
  }[];
  chartData: { month: string; total: number }[];
  priceUsd: number | null;
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm font-semibold tabular-nums">
          {payload[0].value} SOL
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard({
  totalEarning,
  last30daysEarning,
  last7daysEarning,
  totalTransactions,
  uniqueSupporters,
  recentTransactions,
  chartData,
  priceUsd,
}: DashboardProps) {
  const [chartRef, chartInView] = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  const usdSub = (sol: number) =>
    priceUsd != null ? `≈ ${formatUsd(sol * priceUsd)}` : "—";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your support, on-chain and in real time.
        </p>
      </div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            label="Total earned"
            accent="money"
            icon={<Coins className="h-5 w-5" />}
            value={
              <span className="font-mono text-money">
                <CountUp value={totalEarning} decimals={2} suffix=" SOL" />
              </span>
            }
            sub={usdSub(totalEarning)}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Supporters"
            icon={<Users className="h-5 w-5" />}
            value={<CountUp value={uniqueSupporters} decimals={0} />}
            sub={`${totalTransactions} contribution${totalTransactions === 1 ? "" : "s"}`}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Last 30 days"
            icon={<Calendar className="h-5 w-5" />}
            value={
              <span className="font-mono">
                <CountUp value={last30daysEarning} decimals={2} suffix=" SOL" />
              </span>
            }
            sub={usdSub(last30daysEarning)}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Last 7 days"
            icon={<TrendingUp className="h-5 w-5" />}
            value={
              <span className="font-mono">
                <CountUp value={last7daysEarning} decimals={2} suffix=" SOL" />
              </span>
            }
            sub={usdSub(last7daysEarning)}
          />
        </motion.div>
      </motion.div>

      {/* Chart + transactions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card ref={chartRef}>
          <CardHeader>
            <CardTitle className="text-base">Earnings overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-1">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9945ff" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#9945ff" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="month"
                  stroke="#6b6b78"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b6b78"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(153,69,255,0.08)" }}
                />
                <Bar
                  dataKey="total"
                  fill="url(#barFill)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={44}
                  isAnimationActive={chartInView}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent support</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-5 w-5" />}
                title="No support yet"
                description="Share your link and your first contributions will show up here."
                action={
                  <Button asChild variant="brand" size="sm">
                    <Link href="/home">
                      View your page
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {recentTransactions.map((t, i) => (
                  <motion.li
                    key={t.hash}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <a
                      href={`https://solscan.io/tx/${t.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface-2/40"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-money/10 text-money">
                        <Coins className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <AddressChip address={t.fromPublicKey} />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-sm font-semibold text-money tabular-nums">
                          +{t.amount} SOL
                        </span>
                        <StatusBadge status={t.status} />
                      </div>
                    </a>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

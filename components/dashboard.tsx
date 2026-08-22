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
        <p className="font-mono text-sm font-semibold tabular-nums text-money">
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
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.03em]">
            Overview
          </h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/home">
            View public page
            <ArrowUpRight className="h-4 w-4 ml-1.5" />
          </Link>
        </Button>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
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
            icon={<Coins className="h-4 w-4" />}
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
            icon={<Users className="h-4 w-4" />}
            value={<CountUp value={uniqueSupporters} decimals={0} />}
            sub={`${totalTransactions} contribution${totalTransactions === 1 ? "" : "s"}`}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Last 30 days"
            icon={<Calendar className="h-4 w-4" />}
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
            icon={<TrendingUp className="h-4 w-4" />}
            value={
              <span className="font-mono">
                <CountUp value={last7daysEarning} decimals={2} suffix=" SOL" />
              </span>
            }
            sub={usdSub(last7daysEarning)}
          />
        </motion.div>
      </motion.div>

      {/* ── Chart & Activity ──────────────────────────────────── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card ref={chartRef}>
          <CardHeader className="pb-2">
            <CardTitle>Earnings history</CardTitle>
          </CardHeader>
          <CardContent className="pl-1 pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      {/* Switched to money color for financial data */}
                      <stop offset="0%" stopColor="#10d97e" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10d97e" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--color-border)"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#545468"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#545468"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}`}
                    width={48}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "var(--color-surface-2)" }}
                  />
                  <Bar
                    dataKey="total"
                    fill="url(#barFill)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                    isAnimationActive={chartInView}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Recent support</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pt-4">
            {recentTransactions.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-5 w-5" />}
                title="No support yet"
                description="Share your link and your first contributions will show up here."
                className="h-full border-none bg-transparent"
              />
            ) : (
              <ul className="-mx-2 space-y-1">
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
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <AddressChip address={t.fromPublicKey} />
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(t.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-[13px] font-semibold text-money tabular-nums">
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

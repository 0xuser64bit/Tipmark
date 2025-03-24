"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { DropdownSettings } from "./dropdown";
import { motion } from "framer-motion";
import { AnimatedCard } from "./ui/animated-card";
import { useInView } from "react-intersection-observer";

interface DashboardProps {
  totalEarning: string;
  last30daysEarning: string;
  last7daysEarning: string;
  totalTrasactions: string;
  recentTransactions: {
    hash: string;
    amount: string;
    fromPublicKey: string;
    createdAt: Date;
  }[];
  chartData: {
    month: string;
    total: number;
  }[];
}

const ShowMonthlyDataTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 p-2 rounded-md shadow-md">
        <p className="text-zinc-100">{`${label} : ${payload[0].value} SOL`}</p>
      </div>
    );
  }

  return null;
};

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.4,
    },
  },
};

export default function Dashboard({
  totalEarning,
  last30daysEarning,
  last7daysEarning,
  totalTrasactions,
  recentTransactions,
  chartData,
}: DashboardProps) {
  // Use intersection observer for the chart section
  const [chartRef, chartInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="flex-col md:flex">
      <div>
        <div className="flex h-16 justify-between items-center border-b border-zinc-700 ml-8">
          <motion.div
            className="flex items-center space-x-4"
            role="button"
            onClick={() => redirect("/home")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="font-bold">DAOnation</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DropdownSettings />
          </motion.div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </motion.div>

        {/* Stats Cards - Using staggered animation */}
        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <AnimatedCard hoverEffect={true}>
              <Card className="bg-zinc-800 text-zinc-100 border-zinc-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Earning
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{totalEarning} SOL</div>
                  <p className="text-xs text-zinc-400">around $$$+ USD</p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard hoverEffect={true} delay={0.1}>
              <Card className="bg-zinc-800 text-zinc-100 border-zinc-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Last 30 days Earning
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    +{last30daysEarning} SOL
                  </div>
                  <p className="text-xs text-zinc-400">around $$$+ USD</p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard hoverEffect={true} delay={0.2}>
              <Card className="bg-zinc-800 text-zinc-100 border-zinc-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Last 7 days Earning
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-zinc-400" />{" "}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    +{last7daysEarning} SOL
                  </div>
                  <p className="text-xs text-zinc-400">around $$$+ USD</p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedCard hoverEffect={true} delay={0.3}>
              <Card className="bg-zinc-800 text-zinc-100 border-zinc-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Trasactions
                  </CardTitle>
                  <Activity className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{totalTrasactions}</div>
                  <p className="text-xs text-zinc-400">+XXX since last hour</p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </motion.div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          <motion.div
            className="lg:w-1/2"
            ref={chartRef}
            variants={chartVariants}
            initial="hidden"
            animate={chartInView ? "show" : "hidden"}
          >
            <AnimatedCard>
              <Card className="bg-zinc-800 text-zinc-100 col-span-4 border-zinc-700 h-full">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        padding={{ top: 20, bottom: 20 }}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value} SOL`}
                      />
                      <Tooltip
                        content={<ShowMonthlyDataTooltip />}
                        cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </AnimatedCard>
          </motion.div>

          <motion.div
            className="lg:w-1/2"
            variants={chartVariants}
            initial="hidden"
            animate={chartInView ? "show" : "hidden"}
          >
            <AnimatedCard delay={0.2}>
              <Card className="bg-zinc-800 text-zinc-100 col-span-4 border-zinc-700 h-full">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {recentTransactions.map((transaction, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(99, 102, 241, 0.1)",
                        }}
                        className="rounded-lg"
                      >
                        <a
                          href={`https://solscan.io/tx/${transaction.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="flex sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:bg-zinc-500/10 cursor-pointer px-4 py-3 rounded-lg">
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src="/sol.png" alt={"SOL"} />
                              <AvatarFallback>{"D"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow min-w-0">
                              <p className="text-sm font-medium leading-none hidden md:block">
                                {transaction.fromPublicKey}
                              </p>
                              <p className="text-sm font-medium leading-none md:hidden block">
                                {transaction.fromPublicKey.substring(0, 4) +
                                  "..." +
                                  transaction.fromPublicKey.substring(
                                    transaction.fromPublicKey.length - 4,
                                  )}
                              </p>
                              <p className="text-sm text-zinc-400 mt-1">
                                {transaction.createdAt.toDateString()}
                              </p>
                            </div>
                            <div className="font-medium text-sm sm:text-base sm:ml-auto">
                              +{transaction.amount} SOL
                            </div>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                    {recentTransactions.length === 0 && (
                      <motion.p
                        className="text-center text-sm text-muted-foreground text-red-500 font-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        No recent transactions
                      </motion.p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

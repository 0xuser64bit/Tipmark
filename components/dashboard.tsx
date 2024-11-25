"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DropdownSettings } from "./dropdown";

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

export default function Dashboard({
  totalEarning,
  last30daysEarning,
  last7daysEarning,
  totalTrasactions,
  recentTransactions,
  chartData,
}: DashboardProps) {
  return (
    <div className="flex-col md:flex">
      <div>
        <div className="flex h-16 justify-between items-center border-b border-zinc-700 ml-8">
          <div
            className="flex items-center space-x-4"
            role="button"
            onClick={() => redirect("/home")}
          >
            <span className="font-bold">DAOnation</span>
          </div>
          <div>
            <DropdownSettings />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <Card className="bg-zinc-800 text-zinc-100 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last 30 days Earning
              </CardTitle>
              <DollarSign className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{last30daysEarning} SOL</div>
              <p className="text-xs text-zinc-400">around $$$+ USD</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 text-zinc-100 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last 7 days Earning
              </CardTitle>
              <DollarSign className="h-4 w-4 text-zinc-400" />{" "}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{last7daysEarning} SOL</div>
              <p className="text-xs text-zinc-400">around $$$+ USD</p>
            </CardContent>
          </Card>
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
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          <Card className="bg-zinc-800 text-zinc-100 col-span-4 border-zinc-700 lg:w-1/2">
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
                  <Bar dataKey="total" fill="#ffffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 text-zinc-100 col-span-4 border-zinc-700 lg:w-1/2">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentTransactions.map((transaction, i) => (
                  <a
                    key={i}
                    href={`https://solscan.io/tx/${transaction.hash}?cluster=devnet`}
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
                              transaction.fromPublicKey.length - 4
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

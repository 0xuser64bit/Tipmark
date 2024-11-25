"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
  {
    month: "Jan",
    total: 1234,
  },
  {
    month: "Feb",
    total: 2100,
  },
  {
    month: "Mar",
    total: 1800,
  },
  {
    month: "Apr",
    total: 1600,
  },
  {
    month: "May",
    total: 2800,
  },
  {
    month: "Jun",
    total: 2400,
  },
  {
    month: "Jul",
    total: 2100,
  },
  {
    month: "Aug",
    total: 3200,
  },
  {
    month: "Sep",
    total: 2800,
  },
  {
    month: "Oct",
    total: 2000,
  },
  {
    month: "Nov",
    total: 2500,
  },
  {
    month: "Dec",
    total: 3500,
  },
];

const recentDonations = [
  {
    name: "Crypto Foundation",
    publicKey: "2bmDBC2NhL2MFYJja5soLF49DBjGvsJ7MtPahA4caUDx",
    amount: 199.99,
  },
  {
    name: "Web3 Initiative",
    publicKey: "2bmDBC2NhL2MFYJja5soLF49DBjGvsJ7MtPahA4caUDx",
    amount: 39.99,
  },
  {
    name: "DeFi Project",
    publicKey: "2bmDBC2NhL2MFYJja5soLF49DBjGvsJ7MtPahA4caUDx",
    amount: 299.99,
  },
  {
    name: "Blockchain Academy",
    publicKey: "2bmDBC2NhL2MFYJja5soLF49DBjGvsJ7MtPahA4caUDx",
    amount: 99.99,
  },
  {
    name: "NFT Charity",
    publicKey: "2bmDBC2NhL2MFYJja5soLF49DBjGvsJ7MtPahA4caUDx",
    amount: 39.99,
  },
];

export default function Dashboard() {
  return (
    <div className="flex-col md:flex">
      <div>
        <div className="flex h-16 items-center border-b border-zinc-700 ml-8">
          <div
            className="flex items-center space-x-4"
            role="button"
            onClick={() => redirect("/home")}
          >
            <span className="font-bold">DAOnation</span>
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
              <div className="text-2xl font-bold">45.89 SOL</div>
              <p className="text-xs text-zinc-400">around 3400+ USD</p>
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
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-zinc-400">around 1400+ USD</p>
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
              <div className="text-2xl font-bold">12,234</div>
              <p className="text-xs text-zinc-400">around 340+ USD</p>
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
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-zinc-400">+201 since last hour</p>
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
                <BarChart data={data}>
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
              <div className="space-y-4 sm:space-y-6">
                {recentDonations.map((donation, i) => (
                  <div
                    className="flex sm:flex-row items-start sm:items-center gap-2 sm:gap-4"
                    key={i}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src="/sol.png" alt={donation.name} />
                      <AvatarFallback>{donation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium leading-none hidden md:block">
                        {donation.publicKey}
                      </p>
                      <p className="text-sm font-medium leading-none md:hidden block">
                        {donation.publicKey.substring(0, 4) +
                          "..." +
                          donation.publicKey.substring(
                            donation.publicKey.length - 4
                          )}
                      </p>
                      <p className="text-sm text-zinc-400 mt-1">
                        {donation.name}
                      </p>
                    </div>
                    <div className="font-medium text-sm sm:text-base sm:ml-auto">
                      +{donation.amount} SOL
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

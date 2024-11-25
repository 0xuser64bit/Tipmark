import { getLast30daysEarning } from "@/actions/getLast30daysEarning";
import { getLast7daysEarning } from "@/actions/getLast7daysEarning";
import { getRecentTransactions } from "@/actions/getRecentTransactions";
import { getTotalEarning } from "@/actions/getTotalEarning";
import { getTotalTrasactions } from "@/actions/getTotalTrasactions";
import Dashboard from "@/components/dashboard";
import { auth } from "@/lib/auth";

const chartData: {
  month: string;
  total: number;
}[] = [
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

export default async function DashboardPage() {
  const session = await auth();
  const totalEarning = await getTotalEarning({
    userId: session?.user?.email!,
  });
  const last30daysEarning = await getLast30daysEarning({
    userId: session?.user?.email!,
  });
  const last7daysEarning = await getLast7daysEarning({
    userId: session?.user?.email!,
  });
  const totalTrasactions = await getTotalTrasactions({
    userId: session?.user?.email!,
  });
  const recentTransactions = await getRecentTransactions({
    userId: session?.user?.email!,
  });
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 px-0 md:px-10">
      <Dashboard
        totalEarning={totalEarning.toFixed(2)}
        last30daysEarning={last30daysEarning.toFixed(2)}
        last7daysEarning={last7daysEarning.toFixed(2)}
        totalTrasactions={totalTrasactions.toString()}
        recentTransactions={recentTransactions}
        chartData={chartData}
      />
    </div>
  );
}

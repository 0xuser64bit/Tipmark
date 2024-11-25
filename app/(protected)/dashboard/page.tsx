import { getLast30daysEarning } from "@/actions/getLast30daysEarning";
import { getLast7daysEarning } from "@/actions/getLast7daysEarning";
import { getMonthlyEarningData } from "@/actions/getMonthlyEarningData";
import { getRecentTransactions } from "@/actions/getRecentTransactions";
import { getTotalEarning } from "@/actions/getTotalEarning";
import { getTotalTrasactions } from "@/actions/getTotalTrasactions";
import Dashboard from "@/components/dashboard";
import { auth } from "@/lib/auth";

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
  const chartData = await getMonthlyEarningData({
    userId: session?.user?.email!,
  });
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 px-0 md:px-10">
      <Dashboard
        totalEarning={totalEarning.toFixed(2) || "0"}
        last30daysEarning={last30daysEarning.toFixed(2) || "0"}
        last7daysEarning={last7daysEarning.toFixed(2) || "0"}
        totalTrasactions={totalTrasactions.toString() || "0"}
        recentTransactions={recentTransactions}
        chartData={chartData}
      />
    </div>
  );
}

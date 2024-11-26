import { getEarningData } from "@/actions/getEarningData";
import Dashboard from "@/components/dashboard";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const {
    totalEarning,
    last30daysEarning,
    last7daysEarning,
    totalTrasactions,
    recentTransactions,
    monthlyEarningData,
  } = await getEarningData({
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
        chartData={monthlyEarningData}
      />
    </div>
  );
}

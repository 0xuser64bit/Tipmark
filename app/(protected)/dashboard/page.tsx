import { getEarningData } from "@/actions/getEarningData";
import Dashboard from "@/components/dashboard";
import { auth } from "@/lib/auth";
import { PageTransition } from "@/components/ui/page-transition";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import { FloatingIcons } from "@/components/ui/floating-icons";

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
    <div className="min-h-screen bg-zinc-900 text-zinc-100 px-0 md:px-10 relative">
      <FloatingIcons
        iconCount={50}
        iconColor="rgba(99, 102, 241, 0.1)"
        iconSize={32}
        speed={15}
      />

      <PageTransition>
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard
            totalEarning={totalEarning.toFixed(2) || "0"}
            last30daysEarning={last30daysEarning.toFixed(2) || "0"}
            last7daysEarning={last7daysEarning.toFixed(2) || "0"}
            totalTrasactions={totalTrasactions.toString() || "0"}
            recentTransactions={recentTransactions}
            chartData={monthlyEarningData}
          />
        </Suspense>
      </PageTransition>
    </div>
  );
}

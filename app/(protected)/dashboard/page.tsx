import { getEarningData } from "@/actions/getEarningData";
import { getSolPrice } from "@/actions/getSolPrice";
import Dashboard from "@/components/dashboard";
import { AppNav } from "@/components/app-nav";
import { DropdownSettings } from "@/components/dropdown";
import { PageTransition } from "@/components/ui/page-transition";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const [data, priceUsd] = await Promise.all([
    getEarningData({ userId: email }),
    getSolPrice(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav right={<DropdownSettings />} />
      <PageTransition>
        <Dashboard
          totalEarning={data.totalEarning}
          last30daysEarning={data.last30daysEarning}
          last7daysEarning={data.last7daysEarning}
          totalTransactions={data.totalTrasactions}
          uniqueSupporters={data.uniqueSupporters}
          recentTransactions={data.recentTransactions}
          chartData={data.monthlyEarningData}
          priceUsd={priceUsd}
        />
      </PageTransition>
    </div>
  );
}

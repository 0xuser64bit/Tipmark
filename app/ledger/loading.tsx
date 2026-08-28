import { SiteHeader } from "@/components/site-header";
import { StatementSkeleton } from "@/components/statement-skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav />
      <StatementSkeleton />
    </div>
  );
}

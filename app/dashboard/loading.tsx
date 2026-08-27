import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav />
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8">
        <div className="border-b border-rule py-8">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-4 h-[58px] w-[320px] max-w-full" />
        </div>
        <div className="grid grid-cols-2 divide-rule border-b border-rule sm:grid-cols-4 sm:divide-x">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="py-5 pr-4 sm:pl-5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="mt-3.5 h-6 w-24" />
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          <Skeleton className="h-[92px] lg:order-2" />
          <Skeleton className="h-[320px] rounded-[6px] lg:order-1" />
        </div>
      </div>
    </div>
  );
}

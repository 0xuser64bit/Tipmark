import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";

/**
 * A creator's page while it loads: the shape of the letterhead, blocked out.
 * Matching the real layout means nothing shifts when the content lands.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8">
        <div className="relative mt-6 sm:mt-8">
          <Skeleton className="h-[136px] rounded-[6px] sm:h-[188px]" />
          <div className="absolute -bottom-9 left-5 sm:-bottom-11 sm:left-7">
            <Skeleton className="size-[76px] rounded-[5px] border-[3px] border-paper sm:size-[96px]" />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 items-start gap-10 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_364px] lg:gap-14">
          <div>
            <Skeleton className="h-9 w-[280px] max-w-full" />
            <Skeleton className="mt-3.5 h-4 w-[180px]" />
            <div className="mt-8 space-y-2.5">
              <Skeleton className="h-4 w-full max-w-[52ch]" />
              <Skeleton className="h-4 w-full max-w-[48ch]" />
              <Skeleton className="h-4 w-[60%] max-w-[30ch]" />
            </div>
          </div>
          <Skeleton className="h-[420px] rounded-[6px]" />
        </div>
      </div>
    </div>
  );
}

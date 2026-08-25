import { getSolPrice } from "@/actions/getSolPrice";
import { validateSignature } from "@/actions/validateSignature";
import { Receipt } from "@/components/receipt";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Receipt" };

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ signature: string }>;
}) {
  const { signature } = await params;
  const [{ transaction, creator }, priceUsd] = await Promise.all([
    validateSignature(signature),
    getSolPrice(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader width="text" />
      <main
        id="main"
        className="flex flex-1 items-start justify-center px-5 py-12 sm:py-16"
      >
        <Receipt
          signature={signature}
          amount={transaction.amount}
          toPublicKey={transaction.toPublicKey}
          fromPublicKey={transaction.fromPublicKey}
          status={transaction.status}
          createdAt={transaction.createdAt}
          priceUsd={priceUsd}
          creatorUsername={creator?.username ?? undefined}
          creatorName={creator?.display_name ?? undefined}
        />
      </main>
    </div>
  );
}

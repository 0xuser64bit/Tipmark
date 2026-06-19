import { validateSignature } from "@/actions/validateSignature";
import { CheckExplorerCard } from "@/components/check-explorer-card";
import { PageTransition } from "@/components/ui/page-transition";

export default async function CheckExplorerPage({
  params,
}: {
  params: Promise<{ signature: string }>;
}) {
  const { signature } = await params;
  const { transaction, creator } = await validateSignature(signature);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-grid p-4">
      <PageTransition>
        <CheckExplorerCard
          signature={signature}
          amount={transaction.amount}
          toPublicKey={transaction.toPublicKey}
          creatorUsername={creator?.username ?? undefined}
          creatorName={creator?.display_name ?? undefined}
        />
      </PageTransition>
    </div>
  );
}

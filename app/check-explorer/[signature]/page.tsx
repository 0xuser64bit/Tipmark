import { validateSignature } from "@/actions/validateSignature";
import { CheckExplorerCard } from "@/components/check-explorer-card";

export default async function CheckExplorerPage({ params }: { params: any }) {
  const { signature } = await params;
  await validateSignature(signature);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <CheckExplorerCard signature={signature} />
    </div>
  );
}

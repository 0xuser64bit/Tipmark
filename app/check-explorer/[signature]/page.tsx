import { validateSignature } from "@/actions/validateSignature";
import { CheckExplorerCard } from "@/components/check-explorer-card";
import { PageTransition } from "@/components/ui/page-transition";
import EnhancedParticles from "@/components/ui/enhanced-particles";

export default async function CheckExplorerPage({ params }: { params: any }) {
  const { signature } = await params;
  await validateSignature(signature);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated particles in the background */}
      <EnhancedParticles
        variant="stars"
        color={["#6366f1", "#8b5cf6", "#d946ef"]}
        density={30}
        speed={0.5}
      />

      {/* Animated page transition for the card */}
      <PageTransition>
        <CheckExplorerCard signature={signature} />
      </PageTransition>
    </div>
  );
}

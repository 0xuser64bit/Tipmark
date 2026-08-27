import ProtocolProfileEditor from "@/components/protocol-profile-editor";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { normalizeUsername } from "@/lib/protocol/username";

export const metadata = { title: "Claim your page" };

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ handle?: string }>;
}) {
  /* The handle typed on the landing page travels here as a query param, so
     the promise made there is kept. */
  const { handle: desired } = await searchParams;
  const seeded = normalizeUsername(desired ?? "")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);

  return (
    <WalletAdapterWrapper>
      <ProtocolProfileEditor
        mode="setup"
        initial={{
          username: seeded,
          displayName: "",
          description: "",
          coverImage: "",
          profileImage: "",
          solana: "",
          x: "",
          instagram: "",
          github: "",
          linkedin: "",
          updates: false,
        }}
      />
    </WalletAdapterWrapper>
  );
}

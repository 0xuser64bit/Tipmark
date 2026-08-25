import ProtocolProfileEditor from "@/components/protocol-profile-editor";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { getProtocolConfig } from "@/lib/protocol/config";
import { redirect } from "next/navigation";

export const metadata = { title: "Claim your page" };

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ handle?: string }>;
}) {
  if (!getProtocolConfig().enabled) redirect("/");
  const { handle: desired } = await searchParams;
  const seeded = (desired ?? "")
    .toLowerCase()
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

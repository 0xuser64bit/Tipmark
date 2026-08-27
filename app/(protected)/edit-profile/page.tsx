import GetUserInfoAction from "@/actions/getUserInfo";
import ProtocolProfileEditor from "@/components/protocol-profile-editor";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { auth } from "@/lib/auth";
import { resolveOnChainProfile } from "@/lib/protocol/public-profile";
import { normalizeUsername } from "@/lib/protocol/username";
import { redirect } from "next/navigation";

export const metadata = { title: "Your page" };

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ handle?: string }>;
}) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const { data } = await GetUserInfoAction({ email });
  if (!data) redirect("/");

  /* The handle typed on the landing page travels through OAuth as a query
     param, so the promise made there is kept here. */
  const { handle: desired } = await searchParams;
  const seeded = normalizeUsername(desired ?? "").replace(/[^a-z0-9-]/g, "");

  const onChain = data.username
    ? await resolveOnChainProfile(data.username).catch(() => null)
    : null;

  /* A claimed profile edits as a form; anything else is still a setup. The
     on-chain account is what decides, not the local row. */
  return (
    <WalletAdapterWrapper>
      <ProtocolProfileEditor
        email={email}
        mode={onChain ? "edit" : "setup"}
        profileOwner={onChain?.owner}
        initial={{
          username: onChain?.username ?? seeded,
          displayName: onChain?.metadata.displayName ?? "",
          description: onChain?.metadata.bio ?? "",
          coverImage: onChain?.metadata.images.cover ?? "",
          profileImage: onChain?.metadata.images.avatar ?? "",
          solana: onChain?.payoutWallet ?? data.solana_public_key ?? "",
          x: onChain?.metadata.links.x ?? "",
          instagram: onChain?.metadata.links.instagram ?? "",
          github: onChain?.metadata.links.github ?? "",
          linkedin: onChain?.metadata.links.linkedin ?? "",
          updates: data.updates ?? false,
        }}
      />
    </WalletAdapterWrapper>
  );
}

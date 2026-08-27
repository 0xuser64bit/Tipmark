import getUserByEmail from "@/actions/getUserByEmail";
import { getSupporterStats } from "@/actions/getSupporterStats";
import ProfilePage from "@/components/profile-page";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { auth } from "@/lib/auth";
import {
  metadataGatewayUrl,
  resolveOnChainProfile,
} from "@/lib/protocol/public-profile";
import { redirect } from "next/navigation";

export const metadata = { title: "My page" };

export default async function MyPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const user = await getUserByEmail({ email });
  const onChain = user?.username
    ? await resolveOnChainProfile(user.username).catch(() => null)
    : null;

  /* Without a claimed profile there is nothing to show and nowhere for money
     to arrive, so the only useful destination is the editor. */
  if (!onChain) redirect("/edit-profile");

  const stats = await getSupporterStats(onChain.address);

  return (
    <WalletAdapterWrapper>
      <ProfilePage
        profileImage={
          onChain.metadata.images.avatar
            ? metadataGatewayUrl(onChain.metadata.images.avatar)
            : ""
        }
        coverImage={
          onChain.metadata.images.cover
            ? metadataGatewayUrl(onChain.metadata.images.cover)
            : ""
        }
        username={onChain.username}
        displayName={onChain.metadata.displayName}
        description={onChain.metadata.bio}
        x_username={onChain.metadata.links.x || ""}
        github_username={onChain.metadata.links.github || ""}
        instagram_username={onChain.metadata.links.instagram || ""}
        linkedin_username={onChain.metadata.links.linkedin || ""}
        solana_address={onChain.payoutWallet}
        profileOwner={onChain.owner}
        stats={stats}
        isOwner
      />
    </WalletAdapterWrapper>
  );
}

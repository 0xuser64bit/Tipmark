import getUserByEmail from "@/actions/getUserByEmail";
import { getSupporterStats } from "@/actions/getSupporterStats";
import ProfilePage from "@/components/profile-page";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { auth } from "@/lib/auth";
import {
  metadataGatewayUrl,
  resolveOnChainProfile,
} from "@/lib/protocol/public-profile";
import { getProtocolConfig } from "@/lib/protocol/config";
import { redirect } from "next/navigation";

export const metadata = { title: "My page" };

export default async function MyPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const data = await getUserByEmail({ email });

  /* Live requires only the three things a contribution needs: a link to
     arrive at, a name to address, and an address to arrive in. */
  if (!data?.username || !data.display_name || !data.solana_public_key) {
    redirect("/edit-profile");
  }

  const protocol = getProtocolConfig();
  const onChain =
    protocol.enabled && data.username
      ? await resolveOnChainProfile(data.username).catch(() => null)
      : null;
  if (protocol.enabled && !onChain) redirect("/edit-profile");
  const profile = onChain
    ? {
        profileImage: onChain.metadata.images.avatar
          ? metadataGatewayUrl(onChain.metadata.images.avatar)
          : "",
        coverImage: onChain.metadata.images.cover
          ? metadataGatewayUrl(onChain.metadata.images.cover)
          : "",
        username: onChain.username,
        displayName: onChain.metadata.displayName,
        description: onChain.metadata.bio,
        x_username: onChain.metadata.links.x || "",
        github_username: onChain.metadata.links.github || "",
        instagram_username: onChain.metadata.links.instagram || "",
        linkedin_username: onChain.metadata.links.linkedin || "",
        solana_address: onChain.payoutWallet,
        profileOwner: onChain.owner,
      }
    : {
        profileImage: data.profile_image || "",
        coverImage: data.cover_image || "",
        username: data.username.toLowerCase(),
        displayName: data.display_name,
        description: data.description || "",
        x_username: data.x_username || "",
        github_username: data.github_username || "",
        instagram_username: data.instagram_username || "",
        linkedin_username: data.linkedin_username || "",
        solana_address: data.solana_public_key,
        profileOwner: undefined,
      };
  const stats = await getSupporterStats(data.email);

  return (
    <WalletAdapterWrapper>
      <ProfilePage
        {...profile}
        email={data.email}
        stats={stats}
        isOwner
        protocolEnabled={protocol.enabled}
      />
    </WalletAdapterWrapper>
  );
}

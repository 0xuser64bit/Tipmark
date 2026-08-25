import getUserByUsername from "@/actions/getUserByUsername";
import { getSupporterStats } from "@/actions/getSupporterStats";
import ProfilePage from "@/components/profile-page";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { getProtocolConfig } from "@/lib/protocol/config";
import { notFound } from "next/navigation";

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getUserByUsername({ username });

  /* A half-finished profile has nowhere for money to go, so it is not a
     page yet. Better a 404 than a page whose primary action cannot work. */
  if (!data.solana_public_key || !data.display_name) notFound();

  const stats = await getSupporterStats(data.email);

  return (
    <WalletAdapterWrapper>
      <ProfilePage
        profileImage={data.profile_image || ""}
        coverImage={data.cover_image || ""}
        username={username.toLowerCase()}
        displayName={data.display_name}
        description={data.description || ""}
        x_username={data.x_username || ""}
        github_username={data.github_username || ""}
        instagram_username={data.instagram_username || ""}
        linkedin_username={data.linkedin_username || ""}
        solana_address={data.solana_public_key}
        email={data.email}
        stats={stats}
        protocolEnabled={getProtocolConfig().enabled}
        profileOwner={
          "profile_owner" in data ? String(data.profile_owner) : undefined
        }
      />
    </WalletAdapterWrapper>
  );
}

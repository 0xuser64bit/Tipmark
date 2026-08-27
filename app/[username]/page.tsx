import getUserByUsername from "@/actions/getUserByUsername";
import { getSupporterStats } from "@/actions/getSupporterStats";
import ProfilePage from "@/components/profile-page";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const creator = await getUserByUsername({ username });
  const stats = await getSupporterStats(creator.profileAddress);

  return (
    <WalletAdapterWrapper>
      <ProfilePage
        profileImage={creator.profileImage}
        coverImage={creator.coverImage}
        username={creator.username}
        displayName={creator.displayName}
        description={creator.description}
        x_username={creator.x_username}
        github_username={creator.github_username}
        instagram_username={creator.instagram_username}
        linkedin_username={creator.linkedin_username}
        solana_address={creator.payoutWallet}
        stats={stats}
        profileOwner={creator.profileOwner}
      />
    </WalletAdapterWrapper>
  );
}

import getUserByUsername from "@/actions/getUserByUsername";
import { getSupporterStats } from "@/actions/getSupporterStats";
import Home from "@/components/home";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getUserByUsername({ username });
  const stats = await getSupporterStats(data.email);

  return (
    <WalletAdapterWrapper>
      <Home
        profileImage={data.profile_image!}
        coverImage={data.cover_image!}
        username={username.toLocaleLowerCase()!}
        displayName={data.display_name!}
        description={data.description!}
        x_username={data.x_username!}
        github_username={data.github_username!}
        instagram_username={data.instagram_username!}
        linkedin_username={data.linkedin_username!}
        solana_address={data.solana_public_key!}
        email={data.email!}
        stats={stats}
      />
    </WalletAdapterWrapper>
  );
}

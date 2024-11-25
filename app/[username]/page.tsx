import getUserByUsername from "@/actions/getUserByUsername";
import Dashboard from "@/components/dashboard";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";

export default async function UserProfilePage({ params }: { params: any }) {
  const { username } = await params;
  const data = await getUserByUsername({ username });
  const {
    profile_image,
    cover_image,
    display_name,
    description,
    x_username,
    github_username,
    instagram_username,
    linkedin_username,
    solana_public_key,
    email,
  } = data;
  return (
    <WalletAdapterWrapper>
      <Dashboard
        profileImage={profile_image!}
        coverImage={cover_image!}
        username={username.toLocaleLowerCase()!}
        displayName={display_name!}
        description={description!}
        x_username={x_username!}
        github_username={github_username!}
        instagram_username={instagram_username!}
        linkedin_username={linkedin_username!}
        solana_address={solana_public_key!}
        email={email!}
      />
    </WalletAdapterWrapper>
  );
}

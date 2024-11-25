import getUserByEmail from "@/actions/getUserByEmail";
import Dashboard from "@/components/dashboard";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const data = await getUserByEmail({
    email: session?.user?.email!,
  });
  const {
    profile_image,
    cover_image,
    username,
    display_name,
    description,
    x_username,
    github_username,
    instagram_username,
    linkedin_username,
    solana_public_key,
    email,
  } = data!;
  if (
    !profile_image ||
    !cover_image ||
    !username ||
    !display_name ||
    !description ||
    !x_username ||
    !github_username ||
    !instagram_username ||
    !linkedin_username ||
    !solana_public_key ||
    !email
  ) {
    redirect("/edit-profile");
  }
  return (
    <>
      <WalletAdapterWrapper>
        <Dashboard
          profileImage={profile_image}
          coverImage={cover_image}
          username={username.toLocaleLowerCase()}
          displayName={display_name}
          description={description}
          x_username={x_username}
          github_username={github_username}
          instagram_username={instagram_username}
          linkedin_username={linkedin_username}
          solana_address={solana_public_key}
          email={email}
        />
      </WalletAdapterWrapper>
    </>
  );
}

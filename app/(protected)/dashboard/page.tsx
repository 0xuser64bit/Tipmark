import getUserByEmail from "@/actions/getUserByEmail";
import Dashboard from "@/components/dashboard";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const data = await getUserByEmail({
    email: session?.user?.email!,
  });
  return (
    <>
      <WalletAdapterWrapper>
        <Dashboard
          profileImage={data?.profile_image!}
          coverImage={data?.cover_image!}
          username={data?.username!}
          displayName={data?.display_name!}
          description={data?.description!}
          x_username={data?.x_username!}
          github_username={data?.github_username!}
          instagram_username={data?.instagram_username!}
          linkedin_username={data?.linkedin_username!}
          solana_address={data?.solana_public_key!}
        />
      </WalletAdapterWrapper>
    </>
  );
}

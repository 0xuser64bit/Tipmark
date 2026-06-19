import getUserByEmail from "@/actions/getUserByEmail";
import { getSupporterStats } from "@/actions/getSupporterStats";
import Home from "@/components/home";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";

export default async function HomePage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const data = await getUserByEmail({ email });

  // Minimal "live" requirements — claim a handle, a name, and a wallet.
  if (!data || !data.username || !data.display_name || !data.solana_public_key) {
    redirect("/edit-profile");
  }

  const stats = await getSupporterStats(data.email);

  return (
    <PageTransition>
      <WalletAdapterWrapper>
        <Home
          profileImage={data.profile_image || ""}
          coverImage={data.cover_image || ""}
          username={data.username.toLocaleLowerCase()}
          displayName={data.display_name}
          description={data.description || ""}
          x_username={data.x_username || ""}
          github_username={data.github_username || ""}
          instagram_username={data.instagram_username || ""}
          linkedin_username={data.linkedin_username || ""}
          solana_address={data.solana_public_key}
          email={data.email}
          stats={stats}
          isOwner
        />
      </WalletAdapterWrapper>
    </PageTransition>
  );
}

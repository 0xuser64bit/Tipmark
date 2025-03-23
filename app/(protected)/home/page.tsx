import getUserByEmail from "@/actions/getUserByEmail";
import Home from "@/components/home";
import { WalletAdapterWrapper } from "@/components/wallet-adapter-wrapper";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/components/ui/skeleton-loader";
import { FloatingIcons } from "@/components/ui/floating-icons";

export default async function HomePage() {
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
    <PageTransition>
      <Suspense fallback={<ProfileSkeleton />}>
        <WalletAdapterWrapper>
          <div className="relative">
            <FloatingIcons 
              iconCount={8} 
              iconColor="rgba(99, 102, 241, 0.1)" 
              speed={30}
            />
            <Home
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
          </div>
        </WalletAdapterWrapper>
      </Suspense>
    </PageTransition>
  );
}

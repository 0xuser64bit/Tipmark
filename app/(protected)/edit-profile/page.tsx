import GetUserInfoAction from "@/actions/getUserInfo";
import UserProfile from "@/components/user-profile";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/components/ui/skeleton-loader";

export default async function UserProfilePage() {
  const session = await auth();
  const { data, error, statusCode } = await GetUserInfoAction({
    email: session?.user?.email!,
  });

  if (statusCode === 400) {
    redirect("/");
  }

  return (
    <PageTransition>
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile
          coverImageValue={data?.cover_image || ""}
          profileImageValue={data?.profile_image || ""}
          usernameValue={data?.username?.toLocaleLowerCase() || ""}
          displayNameValue={data?.display_name || ""}
          descriptionValue={data?.description || ""}
          instagramValue={data?.instagram_username || ""}
          linkedinValue={data?.linkedin_username || ""}
          twitterValue={data?.x_username || ""}
          githubValue={data?.github_username || ""}
          solanaPublicKeyValue={data?.solana_public_key || ""}
          email={session?.user?.email!}
          updates={data?.updates || false}
        />
      </Suspense>
    </PageTransition>
  );
}

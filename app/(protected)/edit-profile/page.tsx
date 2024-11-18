import GetUserInfoAction from "@/actions/getUserInfo";
import UserProfile from "@/components/user-profile";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserProfilePage() {
  const session = await auth();
  const { data, error, statusCode } = await GetUserInfoAction({
    email: session?.user?.email!,
  });
  if (statusCode === 400) {
    redirect("/");
  }
  return (
    <>
      <UserProfile
        coverImageValue={data?.cover_image || ""}
        profileImageValue={data?.profile_image || ""}
        usernameValue={data?.username || ""}
        displayNameValue={data?.display_name || ""}
        descriptionValue={data?.description || ""}
        instagramValue={data?.instagram_url || ""}
        linkedinValue={data?.linkedin_url || ""}
        twitterValue={data?.x_url || ""}
        githubValue={data?.github_url || ""}
        solanaPublicKeyValue={data?.solana_public_key || ""}
        email={session?.user?.email!}
      />
    </>
  );
}

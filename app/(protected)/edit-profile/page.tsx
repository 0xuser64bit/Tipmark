import GetUserInfoAction from "@/actions/getUserInfo";
import UserProfile from "@/components/user-profile";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";

export default async function EditProfilePage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const { data, statusCode } = await GetUserInfoAction({ email });

  if (statusCode === 404 || !data) {
    redirect("/");
  }

  return (
    <PageTransition>
      <UserProfile
        coverImageValue={data.cover_image || ""}
        profileImageValue={data.profile_image || ""}
        usernameValue={data.username?.toLocaleLowerCase() || ""}
        displayNameValue={data.display_name || ""}
        descriptionValue={data.description || ""}
        instagramValue={data.instagram_username || ""}
        linkedinValue={data.linkedin_username || ""}
        twitterValue={data.x_username || ""}
        githubValue={data.github_username || ""}
        solanaPublicKeyValue={data.solana_public_key || ""}
        email={email}
        updates={data.updates || false}
      />
    </PageTransition>
  );
}

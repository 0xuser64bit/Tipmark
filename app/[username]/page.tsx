import getUserByUsername from "@/actions/getUserByUsername";
import Dashboard from "@/components/dashboard";

export default async function UserProfilePage({ params }: { params: any }) {
    const { username } = await params
  const data = await getUserByUsername({ username });
  return (
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
    />
  );
}

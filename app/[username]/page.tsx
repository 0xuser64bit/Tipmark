import getUserByUsername from "@/actions/getUserByUsername";
import Dashboard from "@/components/dashboard";

export default async function UserProfilePage({ params }: { params: any }) {
  const data = await getUserByUsername({ username: params.username });
  return (
    <Dashboard
      profileImage={data?.profile_image!}
      coverImage={data?.cover_image!}
      username={data?.username!}
      displayName={data?.display_name!}
      description={data?.description!}
      x_url={data?.x_url!}
      github_url={data?.github_url!}
      instagram_url={data?.instagram_url!}
      linkedin_url={data?.linkedin_url!}
    />
  );
}

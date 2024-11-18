import getUserByEmail from "@/actions/getUserByEmail";
import Dashboard from "@/components/dashboard";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const data = await getUserByEmail({
    email: session?.user?.email!,
  });
  return (
    <>
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
    </>
  );
}

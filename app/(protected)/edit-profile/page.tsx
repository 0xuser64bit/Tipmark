import GetUserInfoAction from "@/actions/getUserInfo";
import ProfileEditor from "@/components/profile-editor";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Your page" };

/** Legacy rows stored "#" for empty socials. */
const clean = (v?: string | null) => (v && v.trim() !== "#" ? v.trim() : "");

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ handle?: string }>;
}) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

  const { data } = await GetUserInfoAction({ email });
  if (!data) redirect("/");

  /* A page with a handle, a name and a wallet is live — so its owner gets a
     form, not a wizard. Being walked through three steps to change a bio is
     not onboarding, it is an obstacle. */
  const live = Boolean(
    data.username && data.display_name && data.solana_public_key,
  );

  /* The handle typed on the landing page travels through OAuth as a query
     param, so the promise made there is kept here. */
  const { handle: desired } = await searchParams;
  const seeded = (desired ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "");

  return (
    <EdgeStoreProvider>
      <ProfileEditor
        email={email}
        mode={live ? "edit" : "setup"}
        initial={{
          username: data.username?.toLowerCase() || (live ? "" : seeded),
          displayName: data.display_name ?? "",
          description: data.description ?? "",
          coverImage: data.cover_image ?? "",
          profileImage: data.profile_image ?? "",
          solana: data.solana_public_key ?? "",
          x: clean(data.x_username),
          instagram: clean(data.instagram_username),
          github: clean(data.github_username),
          linkedin: clean(data.linkedin_username),
          updates: data.updates ?? false,
        }}
      />
    </EdgeStoreProvider>
  );
}

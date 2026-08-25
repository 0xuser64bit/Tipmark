import getUserByUsername from "@/actions/getUserByUsername";
import { Metadata } from "next";
import { BRAND_HANDLE, BRAND_NAME } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const data = await getUserByUsername({ username });

  const displayName = data.display_name || `@${username}`;
  const title = displayName;

  const description = data.description
    ? data.description
    : `Support ${displayName} on ${BRAND_NAME} — direct creator support with a verifiable receipt`;

  const profileImageUrl = data.profile_image
    ? data.profile_image
    : "/tipmark-mark.svg";

  return {
    title,
    description,
    openGraph: {
      title: `${displayName} (@${username})`,
      description,
      url: `/${username}`,
      images: [
        {
          url: profileImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName}'s profile picture`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} (@${username})`,
      description,
      images: [profileImageUrl],
      creator: data.x_username ? `@${data.x_username}` : BRAND_HANDLE,
    },
    alternates: {
      canonical: `/${username}`,
    },
    authors: [{ name: displayName }],
  };
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

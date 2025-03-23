import getUserByUsername from "@/actions/getUserByUsername";
import { Metadata } from "next";

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
    : `Support ${displayName} on DAOnation - The coolest way to support your favorite creators`;

  const profileImageUrl = data.profile_image
    ? data.profile_image
    : "/daonation.png";

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
      creator: data.x_username ? `@${data.x_username}` : "@DAOnation",
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

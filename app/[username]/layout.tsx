import getUserByUsername from "@/actions/getUserByUsername";
import { Metadata } from "next";
import { BRAND_HANDLE, BRAND_NAME } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const creator = await getUserByUsername({ username });

  const displayName = creator.displayName;
  const handle = creator.username;
  const description =
    creator.description ||
    `Support ${displayName} on ${BRAND_NAME} — direct creator support with a verifiable receipt`;
  const profileImageUrl = creator.profileImage || "/tipmark-mark.svg";

  return {
    title: displayName,
    description,
    openGraph: {
      title: `${displayName} (@${handle})`,
      description,
      url: `/${handle}`,
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
      title: `${displayName} (@${handle})`,
      description,
      images: [profileImageUrl],
      creator: creator.x_username ? `@${creator.x_username}` : BRAND_HANDLE,
    },
    alternates: {
      canonical: `/${handle}`,
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

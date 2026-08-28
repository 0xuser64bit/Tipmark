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
  /* The avatar is a square upload, so its dimensions are left undeclared
     rather than misreported as a 1200x630 card. Without one, fall back to the
     brand card: the mark is an SVG, which most OG consumers reject. */
  const shareImage = creator.profileImage || "/opengraph-image";

  return {
    title: displayName,
    description,
    openGraph: {
      title: `${displayName} (@${handle})`,
      description,
      url: `/${handle}`,
      images: [{ url: shareImage, alt: `${displayName} on ${BRAND_NAME}` }],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} (@${handle})`,
      description,
      images: [shareImage],
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

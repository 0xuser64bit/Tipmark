import {
  metadataGatewayUrl,
  type ResolvedOnChainProfile,
} from "./public-profile";

/**
 * A profile flattened for transport across the server/client boundary.
 *
 * `resolveOnChainProfile` returns branded addresses and a raw metadata hash,
 * neither of which survives serialization intact. Views carry plain strings
 * and keep both forms of each image: the permanent `ar://` URI the editor
 * must republish unchanged, and a gateway URL the browser can render.
 */
export interface CreatorProfileView {
  profileAddress: string;
  owner: string;
  payoutWallet: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUri: string;
  coverUri: string;
  avatarUrl: string;
  coverUrl: string;
  links: {
    x: string;
    instagram: string;
    github: string;
    linkedin: string;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** A resolution outcome that can cross the boundary without throwing. */
export type CreatorProfileResult =
  | { status: "found"; profile: CreatorProfileView }
  | { status: "unclaimed" }
  | { status: "unavailable"; message: string };

export function toCreatorProfileView(
  resolved: ResolvedOnChainProfile,
): CreatorProfileView {
  const { metadata } = resolved;

  return {
    profileAddress: String(resolved.address),
    owner: String(resolved.owner),
    payoutWallet: String(resolved.payoutWallet),
    username: resolved.username,
    displayName: metadata.displayName,
    bio: metadata.bio,
    avatarUri: metadata.images.avatar || "",
    coverUri: metadata.images.cover || "",
    avatarUrl: metadata.images.avatar
      ? metadataGatewayUrl(metadata.images.avatar)
      : "",
    coverUrl: metadata.images.cover
      ? metadataGatewayUrl(metadata.images.cover)
      : "",
    links: {
      x: metadata.links.x || "",
      instagram: metadata.links.instagram || "",
      github: metadata.links.github || "",
      linkedin: metadata.links.linkedin || "",
    },
    active: resolved.active,
    createdAt: resolved.createdAt,
    updatedAt: resolved.updatedAt,
  };
}

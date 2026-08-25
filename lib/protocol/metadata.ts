export const PROFILE_METADATA_VERSION = 1 as const;

export const PROFILE_METADATA_LIMITS = {
  displayName: 120,
  bio: 4_000,
  imageUri: 300,
  socialHandle: 64,
} as const;

export interface ProfileMetadata {
  version: typeof PROFILE_METADATA_VERSION;
  displayName: string;
  bio: string;
  images: {
    avatar: string | null;
    cover: string | null;
  };
  links: {
    x: string | null;
    instagram: string | null;
    github: string | null;
    linkedin: string | null;
  };
}

export class ProfileMetadataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileMetadataError";
  }
}

function trim(value: string, field: string, maxLength: number): string {
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new ProfileMetadataError(`${field} exceeds its maximum length.`);
  }
  return normalized;
}

function optionalHandle(value: string, field: string): string | null {
  const normalized = trim(value, field, PROFILE_METADATA_LIMITS.socialHandle);
  if (!normalized) return null;
  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(normalized)) {
    throw new ProfileMetadataError(`${field} contains unsupported characters.`);
  }
  return normalized;
}

function optionalContentUri(value: string, field: string): string | null {
  const normalized = trim(value, field, PROFILE_METADATA_LIMITS.imageUri);
  if (!normalized) return null;
  if (!/^(?:ar|ipfs):\/\/[^\s/]+$/i.test(normalized)) {
    throw new ProfileMetadataError(
      `${field} must be an ar:// or ipfs:// content URI.`,
    );
  }
  return normalized;
}

/** Normalize user-entered values into the exact JSON shape hashed on-chain. */
export function normalizeProfileMetadata(input: {
  displayName: string;
  bio?: string;
  avatarUri?: string | null;
  coverUri?: string | null;
  x?: string | null;
  instagram?: string | null;
  github?: string | null;
  linkedin?: string | null;
}): ProfileMetadata {
  const displayName = trim(
    input.displayName,
    "Display name",
    PROFILE_METADATA_LIMITS.displayName,
  );
  if (!displayName) {
    throw new ProfileMetadataError("Display name is required.");
  }

  return {
    version: PROFILE_METADATA_VERSION,
    displayName,
    bio: trim(input.bio || "", "Bio", PROFILE_METADATA_LIMITS.bio),
    images: {
      avatar: optionalContentUri(input.avatarUri || "", "Avatar URI"),
      cover: optionalContentUri(input.coverUri || "", "Cover URI"),
    },
    links: {
      x: optionalHandle(input.x || "", "X handle"),
      instagram: optionalHandle(input.instagram || "", "Instagram handle"),
      github: optionalHandle(input.github || "", "GitHub handle"),
      linkedin: optionalHandle(input.linkedin || "", "LinkedIn handle"),
    },
  };
}

/** A stable JSON representation independent of object insertion order. */
export function canonicalizeProfileMetadata(metadata: ProfileMetadata): string {
  const normalized = normalizeProfileMetadata({
    displayName: metadata.displayName,
    bio: metadata.bio,
    avatarUri: metadata.images.avatar,
    coverUri: metadata.images.cover,
    x: metadata.links.x,
    instagram: metadata.links.instagram,
    github: metadata.links.github,
    linkedin: metadata.links.linkedin,
  });

  return JSON.stringify(normalized);
}

export async function hashProfileMetadata(
  metadata: ProfileMetadata,
): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(canonicalizeProfileMetadata(metadata));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(digest);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function isProfileMetadata(value: unknown): value is ProfileMetadata {
  if (!value || typeof value !== "object") return false;
  try {
    const candidate = value as Record<string, unknown>;
    const images = candidate.images as Record<string, unknown> | null;
    const links = candidate.links as Record<string, unknown> | null;
    if (
      Object.keys(candidate).sort().join(",") !==
        "bio,displayName,images,links,version" ||
      !images ||
      Object.keys(images).sort().join(",") !== "avatar,cover" ||
      !links ||
      Object.keys(links).sort().join(",") !== "github,instagram,linkedin,x" ||
      candidate.version !== PROFILE_METADATA_VERSION ||
      typeof candidate.displayName !== "string" ||
      typeof candidate.bio !== "string"
    ) {
      return false;
    }

    const normalized = normalizeProfileMetadata({
      displayName: candidate.displayName,
      bio: candidate.bio,
      avatarUri: typeof images.avatar === "string" ? images.avatar : "",
      coverUri: typeof images.cover === "string" ? images.cover : "",
      x: typeof links.x === "string" ? links.x : "",
      instagram: typeof links.instagram === "string" ? links.instagram : "",
      github: typeof links.github === "string" ? links.github : "",
      linkedin: typeof links.linkedin === "string" ? links.linkedin : "",
    });

    return (
      canonicalizeProfileMetadata(normalized) === JSON.stringify(normalized)
    );
  } catch {
    return false;
  }
}

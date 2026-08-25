/** Canonical public identity for the product. */
export const BRAND_NAME = "Tipmark";
export const BRAND_DOMAIN =
  process.env.NEXT_PUBLIC_BRAND_DOMAIN?.replace(/^https?:\/\//, "").replace(
    /\/$/,
    "",
  ) || "tipmark.xyz";
export const BRAND_URL = `https://${BRAND_DOMAIN}`;
export const BRAND_HANDLE = "@Tipmark";

export function profileUrl(username: string) {
  return `${BRAND_URL}/${username}`;
}

export const MIN_USERNAME_LENGTH = 2;
export const MAX_USERNAME_LENGTH = 30;

const USERNAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function isValidProtocolUsername(value: string): boolean {
  const length = new TextEncoder().encode(value).length;
  return (
    length >= MIN_USERNAME_LENGTH &&
    length <= MAX_USERNAME_LENGTH &&
    USERNAME_PATTERN.test(value)
  );
}

export function parseProtocolUsername(value: string): string {
  const username = normalizeUsername(value);
  if (!isValidProtocolUsername(username)) {
    throw new Error(
      "Username must be 2-30 lowercase letters, numbers, or single dashes.",
    );
  }
  return username;
}

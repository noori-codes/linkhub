const RESERVED_USERNAMES = new Set(["demo"]);

export function isReservedUsername(username: string) {
  return RESERVED_USERNAMES.has(username.trim().toLowerCase());
}

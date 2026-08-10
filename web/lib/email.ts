/** Strip spaces and force lowercase as the user types. */
export function normalizeEmailInput(value: string): string {
  return value.toLowerCase().replace(/\s/g, "");
}

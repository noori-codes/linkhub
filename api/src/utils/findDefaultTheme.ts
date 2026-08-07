import Theme from "../models/theme.model.js";

/** Prefer Classic by slug; fall back to any isDefault theme. */
export async function findDefaultTheme() {
  const classic = await Theme.findOne({ slug: "classic" });
  if (classic) return classic;
  return Theme.findOne({ isDefault: true });
}

import Theme from "../models/theme.model.js";
import { THEME_SEEDS } from "../data/themes.js";

/** Upsert built-in themes by slug (idempotent). */
export async function ensureThemes() {
  for (const seed of THEME_SEEDS) {
    await Theme.findOneAndUpdate(
      { slug: seed.slug },
      {
        $set: {
          name: seed.name,
          tokens: seed.tokens,
          isDefault: seed.isDefault,
        },
        $setOnInsert: { slug: seed.slug },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
  }

  // Exactly one default
  const defaults = await Theme.find({ isDefault: true });
  if (defaults.length === 0) {
    await Theme.findOneAndUpdate({ slug: "classic" }, { isDefault: true });
  } else if (defaults.length > 1) {
    const keep = defaults.find((t) => t.slug === "classic") ?? defaults[0];
    await Theme.updateMany(
      { _id: { $ne: keep!._id }, isDefault: true },
      { isDefault: false },
    );
  }
}

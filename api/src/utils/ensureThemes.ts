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

  // Classic is always the sole default (by slug, not just isDefault flag)
  await Theme.updateMany({ slug: { $ne: "classic" } }, { isDefault: false });
  await Theme.findOneAndUpdate(
    { slug: "classic" },
    { $set: { isDefault: true } },
    { upsert: false },
  );
}

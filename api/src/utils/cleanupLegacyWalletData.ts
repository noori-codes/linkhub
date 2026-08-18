import Link from "../models/link.model.js";
import User from "../models/user.model.js";

/** One-time cleanup for removed wallet / wallets features. */
export async function cleanupLegacyWalletData() {
  await Promise.all([
    // Legacy enum values removed from types; cast filters for one-time migration.
    Link.updateMany({ type: "wallet" } as never, { $set: { type: "custom" } }),
    User.updateMany(
      { onboardingStep: "wallets" } as never,
      { $set: { onboardingStep: "tags" } },
    ),
  ]);
}

import Link from "../models/link.model.js";
import User from "../models/user.model.js";

/** One-time cleanup for removed wallet / wallets features. */
export async function cleanupLegacyWalletData() {
  await Promise.all([
    Link.updateMany({ type: "wallet" }, { $set: { type: "custom" } }),
    User.updateMany(
      { onboardingStep: "wallets" },
      { $set: { onboardingStep: "tags" } },
    ),
  ]);
}

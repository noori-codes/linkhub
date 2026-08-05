"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OnboardingShell,
  OnboardingSkipFooter,
} from "@/components/onboarding/OnboardingShell";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import {
  onboardingCardClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  setOnboardingStep,
} from "@/lib/onboarding";

type WalletField = {
  platform: string;
  label: string;
  placeholder: string;
  title: string;
};

const WALLETS: WalletField[] = [
  {
    platform: "ethereum",
    label: "Ethereum / ENS",
    placeholder: "0x… or name.eth",
    title: "Ethereum",
  },
  {
    platform: "bitcoin",
    label: "Bitcoin",
    placeholder: "bc1… or address",
    title: "Bitcoin",
  },
  {
    platform: "solana",
    label: "Solana",
    placeholder: "Solana address",
    title: "Solana",
  },
];

function walletUrl(platform: string, value: string) {
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (platform === "ethereum") {
    return v.endsWith(".eth")
      ? `https://app.ens.domains/${encodeURIComponent(v)}`
      : `https://etherscan.io/address/${encodeURIComponent(v)}`;
  }
  if (platform === "bitcoin") {
    return `https://mempool.space/address/${encodeURIComponent(v)}`;
  }
  if (platform === "solana") {
    return `https://solscan.io/account/${encodeURIComponent(v)}`;
  }
  return `https://${encodeURIComponent(v)}`;
}

/** Step 6: optional wallet addresses as wallet-type links. */
export default function OnboardingWalletsPage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(WALLETS.map((w) => [w.platform, ""])),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function ensureProfile() {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.status === 404) {
          router.replace("/onboarding");
          return;
        }
        setReady(true);
      } catch {
        setError("Cannot reach API. Is the backend running?");
        setReady(true);
      }
    }

    void ensureProfile();
  }, [router]);

  async function goNext(token: string) {
    await setOnboardingStep(token, "tags");
    router.push("/onboarding/tags");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      for (const wallet of WALLETS) {
        const raw = values[wallet.platform]?.trim();
        if (!raw) continue;

        const res = await fetch(`${CLIENT_API_BASE}/api/v1/links`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: wallet.title,
            url: walletUrl(wallet.platform, raw),
            type: "wallet",
            platform: wallet.platform,
          }),
        });

        if (!res.ok) {
          const data = (await res.json()) as { message?: string };
          throw new Error(data.message || `Could not add ${wallet.label}`);
        }
      }

      await goNext(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Cannot reach API. Is the backend running?",
      );
    } finally {
      setLoading(false);
    }
  }

  async function onSkip() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    try {
      await goNext(token);
    } catch {
      router.push("/onboarding/tags");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step="wallets"
      title="Add wallets"
      description="Optional — show tipping or payment addresses on your page."
      footer={
        <OnboardingSkipFooter
          onSkip={() => void onSkip()}
          disabled={loading}
        />
      }
    >
      {!ready ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <form onSubmit={onSubmit} className={onboardingCardClass}>
          {WALLETS.map((wallet) => (
            <label
              key={wallet.platform}
              className="flex flex-col gap-1.5 text-left text-sm"
            >
              <span className="font-medium text-text">{wallet.label}</span>
              <input
                type="text"
                value={values[wallet.platform] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [wallet.platform]: e.target.value,
                  }))
                }
                placeholder={wallet.placeholder}
                spellCheck={false}
                autoComplete="off"
                className={`${onboardingInputClass} font-mono text-[13px]`}
              />
            </label>
          ))}

          <p className="text-xs text-text-muted">
            Addresses are stored as links visitors can open. Skip if you don’t
            need this.
          </p>

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={onboardingPrimaryBtnClass}
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      )}
    </OnboardingShell>
  );
}

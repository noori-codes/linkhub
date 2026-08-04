"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { AnalyticsSummary, ApiSuccess } from "@/lib/types";

function formatWhen(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Owner-only summary of public link clicks. */
export function AnalyticsPanel() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/analytics/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        const json = (await res.json()) as ApiSuccess<AnalyticsSummary> & {
          message?: string;
        };

        if (!res.ok) {
          if (!cancelled) {
            setError(json.message || "Could not load analytics");
          }
          return;
        }

        if (!cancelled) {
          setData(json.data);
        }
      } catch {
        if (!cancelled) {
          setError("Cannot reach API. Is the backend running?");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return <p className="text-sm text-text-muted">Loading analytics…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-danger" role="alert">
        {error}
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-text-muted">No analytics yet.</p>;
  }

  const { summary, topLinks, recentClicks } = data;

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard
        title="Overview"
        description="Views and clicks from your published public page."
      >
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-bg px-3 py-3">
            <dt className="text-[10px] uppercase tracking-wide text-text-muted">
              Page views
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-text">
              {summary.profileViews}
            </dd>
          </div>
          <div className="rounded-md border border-border bg-bg px-3 py-3">
            <dt className="text-[10px] uppercase tracking-wide text-text-muted">
              Total clicks
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-text">
              {summary.totalClicks}
            </dd>
          </div>
          <div className="col-span-2 rounded-md border border-border bg-bg px-3 py-3">
            <dt className="text-[10px] uppercase tracking-wide text-text-muted">
              Recorded click events
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-text">
              {summary.eventCount}
            </dd>
          </div>
        </dl>
      </SettingsCard>

      <SettingsCard
        title="Top links"
        description="Ranked by click count on each link."
      >
        {topLinks.length === 0 ? (
          <p className="text-sm text-text-muted">
            No clicks yet. Share your public page and wait for visitors.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {topLinks.map((link, index) => (
              <li
                key={link._id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    <span className="mr-2 text-text-muted">{index + 1}.</span>
                    {link.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {link.url}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-text">
                  {link.clickCount}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>

      <SettingsCard
        title="Recent clicks"
        description="Latest tracked visits from /u/… (newest first)."
      >
        {recentClicks.length === 0 ? (
          <p className="text-sm text-text-muted">No click events logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentClicks.map((event) => (
              <li
                key={event._id}
                className="rounded-md border border-border px-3 py-2.5"
              >
                <p className="truncate text-sm font-medium text-text">
                  {event.link?.title || "Deleted link"}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {formatWhen(event.createdAt)}
                  {event.referrer ? ` · from ${event.referrer}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>
    </div>
  );
}

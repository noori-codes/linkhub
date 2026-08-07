"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { EmptyState } from "@/components/EmptyState";
import { AnalyticsSkeleton } from "@/components/Skeleton";
import { clearToken } from "@/lib/auth";
import {
  fetchMyAnalytics,
  HttpError,
  queryKeys,
} from "@/lib/dashboard-queries";
import type { AnalyticsSummary } from "@/lib/types";

type RecentClick = AnalyticsSummary["recentClicks"][number];

type ClickGroup = {
  key: string;
  title: string;
  url: string;
  events: RecentClick[];
};

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

function formatRelative(iso: string | undefined) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((Date.now() - then) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 48) return rtf.format(-diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  return rtf.format(-diffDay, "day");
}

function groupRecentClicks(events: RecentClick[]): ClickGroup[] {
  const map = new Map<string, ClickGroup>();

  for (const event of events) {
    const key = event.link?._id
      ? String(event.link._id)
      : `deleted:${event._id}`;
    const existing = map.get(key);
    if (existing) {
      existing.events.push(event);
    } else {
      map.set(key, {
        key,
        title: event.link?.title || "Deleted link",
        url: event.link?.url || "",
        events: [event],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aTime = a.events[0]?.createdAt
      ? new Date(a.events[0].createdAt).getTime()
      : 0;
    const bTime = b.events[0]?.createdAt
      ? new Date(b.events[0].createdAt).getTime()
      : 0;
    return bTime - aTime;
  });
}

function RecentClickGroup({ group }: { group: ClickGroup }) {
  const [open, setOpen] = useState(false);
  const latest = group.events[0];
  const count = group.events.length;
  const canExpand = count > 1;

  return (
    <li className="overflow-hidden rounded-xl border border-border">
      <button
        type="button"
        onClick={() => canExpand && setOpen((v) => !v)}
        disabled={!canExpand}
        aria-expanded={canExpand ? open : undefined}
        className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors ${
          canExpand ? "hover:bg-bg" : ""
        } disabled:cursor-default`}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-semibold text-brand"
          aria-hidden
        >
          {count}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">{group.title}</p>
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {formatRelative(latest?.createdAt) || formatWhen(latest?.createdAt)}
            {count > 1 ? ` · ${count} clicks` : ""}
            {group.url ? ` · ${group.url.replace(/^https?:\/\//, "")}` : ""}
          </p>
        </div>
        {canExpand ? (
          <span
            className={`shrink-0 text-text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            ▾
          </span>
        ) : null}
      </button>

      {open && canExpand ? (
        <ul className="border-t border-border bg-bg/60 px-3.5 py-2">
          {group.events.map((event, index) => (
            <li
              key={event._id}
              className="flex items-start justify-between gap-3 py-2 text-xs"
            >
              <span className="text-text-muted">
                #{count - index}
                {event.referrer ? (
                  <span className="mt-0.5 block truncate text-[11px] text-text-muted/80">
                    from {event.referrer}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-right text-text">
                {formatWhen(event.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function AnalyticsPanel() {
  const router = useRouter();
  const [showAllGroups, setShowAllGroups] = useState(false);

  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.analyticsMe,
    queryFn: fetchMyAnalytics,
    retry: false,
  });

  useEffect(() => {
    if (error instanceof HttpError && error.status === 401) {
      clearToken();
      router.replace("/login");
    }
  }, [error, router]);

  const groups = useMemo(
    () => (data ? groupRecentClicks(data.recentClicks) : []),
    [data],
  );

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (isError) {
    const message =
      error instanceof HttpError
        ? error.message
        : "Cannot reach API. Is the backend running?";

    return (
      <p className="text-sm text-danger" role="alert">
        {message}
      </p>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No analytics yet"
        hint="Publish your page and share it to start collecting views and clicks."
      />
    );
  }

  const { summary, topLinks } = data;
  const visibleGroups = showAllGroups ? groups : groups.slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <SettingsCard
        title="Overview"
        description="Views and clicks from your published public page."
      >
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-bg px-4 py-4">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
              Page views
            </dt>
            <dd className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-text">
              {summary.profileViews}
            </dd>
          </div>
          <div className="rounded-xl bg-bg px-4 py-4">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
              Total clicks
            </dt>
            <dd className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-text">
              {summary.totalClicks}
            </dd>
          </div>
          <div className="rounded-xl bg-bg px-4 py-4">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
              Shares
            </dt>
            <dd className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-text">
              {summary.shares ?? 0}
            </dd>
          </div>
          <div className="col-span-2 rounded-xl bg-bg px-4 py-4 sm:col-span-3">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
              Recorded click events
            </dt>
            <dd className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-text">
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
          <EmptyState
            title="No clicks yet"
            hint="Share your public page and wait for visitors."
            className="py-6"
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {topLinks.map((link, index) => (
              <li
                key={link._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3.5 py-3"
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
        description="Grouped by link — expand a row to see each visit."
      >
        {groups.length === 0 ? (
          <EmptyState
            title="No click events yet"
            hint="Clicks on your public links will show up here."
            className="py-6"
          />
        ) : (
          <div className="flex flex-col gap-2">
            <ul className="flex flex-col gap-2">
              {visibleGroups.map((group) => (
                <RecentClickGroup key={group.key} group={group} />
              ))}
            </ul>
            {groups.length > 5 ? (
              <button
                type="button"
                onClick={() => setShowAllGroups((v) => !v)}
                className="mt-1 text-sm font-medium text-brand hover:text-brand-hover"
              >
                {showAllGroups
                  ? "Show fewer"
                  : `Show all ${groups.length} links`}
              </button>
            ) : null}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

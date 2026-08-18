"use client";

import { useState } from "react";

import type { AnalyticsSummary } from "@/lib/types";

type DailyPoint = AnalyticsSummary["daily"][number];
type TopLink = AnalyticsSummary["topLinks"][number];

const INK = "#12141a";
const MUTED = "#5c6470";
const LINE = "#dde1e8";
const CLICKS = "#6b7280";
const SHARES = "#a8b0bb";

function formatDay(isoDate: string) {
  const [, month, day] = isoDate.split("-");
  if (!month || !day) return isoDate;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${Number(day)} ${months[Number(month) - 1] ?? month}`;
}

function pointAt(
  values: number[],
  index: number,
  max: number,
  width: number,
  height: number,
  pad: { top: number; right: number; bottom: number; left: number },
) {
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const last = Math.max(values.length - 1, 1);
  return {
    x: pad.left + (index / last) * innerW,
    y: pad.top + (1 - (values[index] ?? 0) / max) * innerH,
  };
}

function seriesPath(
  values: number[],
  max: number,
  width: number,
  height: number,
  pad: { top: number; right: number; bottom: number; left: number },
) {
  return values
    .map((_, i) => {
      const { x, y } = pointAt(values, i, max, width, height, pad);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function areaPath(
  values: number[],
  max: number,
  width: number,
  height: number,
  pad: { top: number; right: number; bottom: number; left: number },
) {
  const line = seriesPath(values, max, width, height, pad);
  const innerW = width - pad.left - pad.right;
  const baseline = height - pad.bottom;
  return `${line} L${(pad.left + innerW).toFixed(1)} ${baseline} L${pad.left.toFixed(1)} ${baseline} Z`;
}

export function ActivityChart({ daily }: { daily: DailyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 560;
  const height = 200;
  const pad = { top: 12, right: 12, bottom: 28, left: 28 };
  const views = daily.map((d) => d.views);
  const clicks = daily.map((d) => d.clicks);
  const max = Math.max(1, ...views, ...clicks);
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));
  const labelEvery = daily.length > 10 ? 3 : 2;
  const empty = daily.every((d) => d.views === 0 && d.clicks === 0);
  const active = hover != null ? daily[hover] : null;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-50 w-full"
        role="img"
        aria-label="Views and clicks over the last 14 days"
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((tick) => {
          const y = pad.top + (1 - tick / max) * (height - pad.top - pad.bottom);
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke={LINE}
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 3}
                textAnchor="end"
                fill={MUTED}
                fontSize="10"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {daily.map((point, i) =>
          i % labelEvery === 0 || i === daily.length - 1 ? (
            <text
              key={point.date}
              x={pointAt(views, i, max, width, height, pad).x}
              y={height - 8}
              textAnchor="middle"
              fill={MUTED}
              fontSize="10"
            >
              {formatDay(point.date)}
            </text>
          ) : null,
        )}

        <path
          d={areaPath(views, max, width, height, pad)}
          fill={INK}
          fillOpacity="0.08"
        />
        <path
          d={seriesPath(views, max, width, height, pad)}
          fill="none"
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={seriesPath(clicks, max, width, height, pad)}
          fill="none"
          stroke={CLICKS}
          strokeWidth="2"
          strokeDasharray="4 3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {hover != null ? (
          <>
            <line
              x1={pointAt(views, hover, max, width, height, pad).x}
              x2={pointAt(views, hover, max, width, height, pad).x}
              y1={pad.top}
              y2={height - pad.bottom}
              stroke={LINE}
              strokeWidth="1"
            />
            <circle
              cx={pointAt(views, hover, max, width, height, pad).x}
              cy={pointAt(views, hover, max, width, height, pad).y}
              r="3.5"
              fill={INK}
            />
            <circle
              cx={pointAt(clicks, hover, max, width, height, pad).x}
              cy={pointAt(clicks, hover, max, width, height, pad).y}
              r="3.5"
              fill="#fff"
              stroke={CLICKS}
              strokeWidth="2"
            />
          </>
        ) : null}

        {daily.map((_, i) => {
          const x = pointAt(views, i, max, width, height, pad).x;
          const colW = (width - pad.left - pad.right) / Math.max(daily.length, 1);
          return (
            <rect
              key={daily[i]?.date ?? i}
              x={x - colW / 2}
              y={pad.top}
              width={colW}
              height={height - pad.top - pad.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-brand" aria-hidden />
          Views{active ? ` ${active.views}` : ""}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-px w-4 border-t border-dashed border-text-muted"
            aria-hidden
          />
          Clicks{active ? ` ${active.clicks}` : ""}
        </span>
        {active ? (
          <span className="font-medium text-text">{formatDay(active.date)}</span>
        ) : empty ? (
          <span>No activity in this period yet.</span>
        ) : null}
      </div>
    </div>
  );
}

export function MixDonut({
  views,
  clicks,
  shares,
}: {
  views: number;
  clicks: number;
  shares: number;
}) {
  const total = views + clicks + shares;
  const size = 148;
  const cx = size / 2;
  const cy = size / 2;
  const r = 48;
  const stroke = 16;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { label: "Views", value: views, color: INK },
    { label: "Clicks", value: clicks, color: CLICKS },
    { label: "Shares", value: shares, color: SHARES },
  ];

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-36 w-36"
        role="img"
        aria-label={`Traffic mix: ${views} views, ${clicks} clicks, ${shares} shares`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={LINE}
          strokeWidth={stroke}
        />
        {total > 0
          ? segments.map((segment, i) => {
              const length = (segment.value / total) * circumference;
              const dashOffset = -segments
                .slice(0, i)
                .reduce(
                  (sum, item) => sum + (item.value / total) * circumference,
                  0,
                );
              return (
                <circle
                  key={segment.label}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
              );
            })
          : null}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill={INK}
          fontSize="18"
          fontWeight="600"
        >
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={MUTED} fontSize="10">
          events
        </text>
      </svg>
      <ul className="mt-1 flex flex-col gap-1 text-[11px] text-text-muted">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: segment.color }}
              aria-hidden
            />
            {segment.label}
            <span className="font-medium text-text">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopLinksChart({ links }: { links: TopLink[] }) {
  const max = Math.max(1, ...links.map((link) => link.clickCount));

  return (
    <ul className="flex flex-col gap-3" aria-label="Top links by clicks">
      {links.map((link, index) => {
        const pct = Math.max(6, (link.clickCount / max) * 100);
        return (
          <li key={link._id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium text-text">
                <span className="mr-2 text-text-muted">{index + 1}.</span>
                {link.title}
              </p>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-text">
                {link.clickCount}
              </p>
            </div>
            <p className="mt-0.5 truncate pl-6 text-xs text-text-muted">
              {link.url.replace(/^https?:\/\//, "")}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

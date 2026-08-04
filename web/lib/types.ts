// Types shaped like the API responses (Profile + Link models)

export type ProfileStatus = "draft" | "published";

export interface PublicProfile {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  location: string;
  website: string;
  status: ProfileStatus;
  tags: string[];
}

export interface PublicLink {
  _id: string;
  title: string;
  url: string;
  type: string;
  platform: string;
  order: number;
  isVisible: boolean;
  clickCount: number;
}

export interface AnalyticsSummary {
  summary: {
    profileViews: number;
    totalClicks: number;
    linkCount: number;
    eventCount: number;
  };
  topLinks: Array<{
    _id: string;
    title: string;
    url: string;
    clickCount: number;
    isVisible: boolean;
  }>;
  recentClicks: Array<{
    _id: string;
    createdAt?: string;
    referrer: string;
    link: { _id: string; title: string; url: string } | null;
  }>;
}

export interface ApiSuccess<T> {
  status: string;
  results?: number;
  data: T;
}

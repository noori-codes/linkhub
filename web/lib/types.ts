// Types shaped like the API responses (Profile + Link models)

export type ProfileStatus = "draft" | "published";
export type ButtonShape = "square" | "rounded" | "pill";

export interface ThemeTokens {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
}

export interface ProfileTheme {
  _id: string;
  name: string;
  slug: string;
  tokens: ThemeTokens;
  isDefault: boolean;
}

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
  buttonShape?: ButtonShape;
  /** Populated Theme doc, or raw ObjectId string before populate */
  theme?: ProfileTheme | string | null;
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

export interface ShopProduct {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  isVisible: boolean;
  /** Visible buy/affiliate links — required to appear on /u/[username] */
  linkCount: number;
}

/** Product fields returned when a collection populates `products`. */
export interface ShopCollectionProduct {
  _id: string;
  title: string;
  imageUrl: string;
  isVisible: boolean;
  order: number;
}

export interface ShopCollection {
  _id: string;
  title: string;
  description: string;
  products: ShopCollectionProduct[];
  order: number;
  isVisible: boolean;
}

export interface ShopProductLink {
  _id: string;
  title: string;
  url: string;
  isAffiliate: boolean;
  order: number;
  isVisible: boolean;
}

export interface PublicShopProduct {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  isVisible: boolean;
  links: ShopProductLink[];
}

/** Visible collection grouping on a public profile (product ids only). */
export interface PublicShopCollection {
  _id: string;
  title: string;
  description: string;
  order: number;
  products: string[];
}

export interface AnalyticsSummary {
  summary: {
    profileViews: number;
    totalClicks: number;
    shares: number;
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

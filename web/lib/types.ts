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
}

export interface ApiSuccess<T> {
  status: string;
  results?: number;
  data: T;
}

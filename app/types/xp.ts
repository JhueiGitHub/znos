// app/types/xp.ts
import { CreatorTier, CreatorStatus } from "@prisma/client"

export interface XPProfileData {
  name: string;
  imageUrl: string;
  description: string;
  stats: {
    totalDownloads: number;
    totalEarned: number;
    designSystemsPublished: number;
  }
}

export interface XPProfile {
  id: string;
  profileId: string;
  displayName: string | null;
  bio: string | null;
  customImageUrl: string | null;
  creatorTier: CreatorTier;
  creatorStatus: CreatorStatus;
  isVerified: boolean;
  totalDownloads: number;
  totalEarned: number;
  designSystemsPublished: number;
  followersCount: number;
  followingCount: number;
  website: string | null;
  twitter: string | null;
  github: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}
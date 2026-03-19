import { Injectable } from "@nestjs/common";

import { createId } from "./ids";

export type Visibility = "public" | "private";
export type SpotSourceType = "google_place" | "manual" | "copied_spot";

export type SignupSession = {
  id: string;
  email: string;
  passwordDigest: string;
  verificationCode: string;
  isVerified: boolean;
  expiresAt: string;
};

export type UserRecord = {
  id: string;
  userId: string;
  email: string;
  passwordDigest: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  displayName: string;
  profileImageUrl?: string;
  bio?: string;
  createdAt: string;
};

export type MapRecord = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  visibility: Visibility;
  isDefault: boolean;
  defaultType?: "favorite" | "want_to_go";
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type SpotRecord = {
  id: string;
  mapId: string;
  createdBy: string;
  sourceSpotId?: string;
  sourceType: SpotSourceType;
  googlePlaceId?: string;
  formattedAddress?: string;
  name: string;
  comment?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class InMemoryStore {
  signupSessions: SignupSession[] = [];

  users: UserRecord[] = [];

  maps: MapRecord[] = [];

  spots: SpotRecord[] = [];

  mapSaves: { id: string; userId: string; mapId: string }[] = [];

  mapLikes: { id: string; userId: string; mapId: string }[] = [];

  follows: { id: string; followerUserId: string; followeeUserId: string }[] = [];

  blocks: { id: string; blockerUserId: string; blockedUserId: string }[] = [];

  constructor() {
    const now = new Date().toISOString();
    const hanakoId = "usr_hanako";
    const taroId = "usr_taro";

    this.users = [
      {
        id: hanakoId,
        userId: "hanako_map",
        email: "hanako@example.com",
        passwordDigest: "password123",
        lastName: "田中",
        firstName: "花子",
        birthDate: "1998-01-15",
        displayName: "花子",
        bio: "吉祥寺が好き",
        createdAt: now
      },
      {
        id: taroId,
        userId: "taro_map",
        email: "taro@example.com",
        passwordDigest: "password123",
        lastName: "佐藤",
        firstName: "太郎",
        birthDate: "1996-07-08",
        displayName: "太郎",
        bio: "ラーメン探索中",
        createdAt: now
      }
    ];

    this.maps = [
      {
        id: "map_hanako_public",
        userId: hanakoId,
        title: "吉祥寺カフェ",
        description: "落ち着く店を集めた",
        visibility: "public",
        isDefault: false,
        tags: ["カフェ", "吉祥寺"],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "map_hanako_favorite",
        userId: hanakoId,
        title: "お気に入り",
        visibility: "private",
        isDefault: true,
        defaultType: "favorite",
        tags: [],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "map_hanako_want",
        userId: hanakoId,
        title: "行きたい",
        visibility: "private",
        isDefault: true,
        defaultType: "want_to_go",
        tags: [],
        createdAt: now,
        updatedAt: now
      },
      {
        id: "map_taro_public",
        userId: taroId,
        title: "新宿ラーメン",
        description: "深夜でも行ける店を中心に",
        visibility: "public",
        isDefault: false,
        tags: ["ラーメン", "新宿"],
        createdAt: now,
        updatedAt: now
      }
    ];

    this.spots = [
      {
        id: "spot_1",
        mapId: "map_hanako_public",
        createdBy: hanakoId,
        sourceType: "manual",
        formattedAddress: "東京都武蔵野市吉祥寺本町1-1-1",
        name: "喫茶A",
        comment: "静かで落ち着く",
        latitude: 35.703,
        longitude: 139.579,
        tags: ["カフェ"],
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "spot_2",
        mapId: "map_taro_public",
        createdBy: taroId,
        sourceType: "google_place",
        googlePlaceId: "ChIJxxxx",
        formattedAddress: "東京都新宿区西新宿1-1-1",
        name: "麺処B",
        comment: "深夜営業",
        latitude: 35.69,
        longitude: 139.7,
        tags: ["ラーメン"],
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      }
    ];

    this.follows = [{ id: createId("follow"), followerUserId: hanakoId, followeeUserId: taroId }];
  }
}

import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordDigest: varchar("password_digest", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  birthDate: date("birth_date").notNull(),
  displayName: varchar("display_name", { length: 30 }).notNull(),
  profileImageUrl: text("profile_image_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const authSignupSessions = pgTable("auth_signup_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordDigest: varchar("password_digest", { length: 255 }).notNull(),
  verificationCode: varchar("verification_code", { length: 20 }).notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const maps = pgTable("maps", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  visibility: varchar("visibility", { length: 20 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  defaultType: varchar("default_type", { length: 30 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const spots = pgTable("spots", {
  id: varchar("id", { length: 64 }).primaryKey(),
  mapId: varchar("map_id", { length: 64 }).notNull(),
  createdBy: varchar("created_by", { length: 64 }).notNull(),
  sourceSpotId: varchar("source_spot_id", { length: 64 }),
  sourceType: varchar("source_type", { length: 20 }).notNull(),
  googlePlaceId: varchar("google_place_id", { length: 255 }),
  formattedAddress: text("formatted_address"),
  name: varchar("name", { length: 100 }).notNull(),
  comment: text("comment"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const tags = pgTable("tags", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  tagType: varchar("tag_type", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const mapTags = pgTable(
  "map_tags",
  {
    mapId: varchar("map_id", { length: 64 }).notNull(),
    tagId: varchar("tag_id", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [primaryKey({ columns: [table.mapId, table.tagId] })]
);

export const spotTags = pgTable(
  "spot_tags",
  {
    spotId: varchar("spot_id", { length: 64 }).notNull(),
    tagId: varchar("tag_id", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [primaryKey({ columns: [table.spotId, table.tagId] })]
);

export const mapSaves = pgTable("map_saves", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  mapId: varchar("map_id", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const mapLikes = pgTable("map_likes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  mapId: varchar("map_id", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const follows = pgTable("follows", {
  id: varchar("id", { length: 64 }).primaryKey(),
  followerUserId: varchar("follower_user_id", { length: 64 }).notNull(),
  followeeUserId: varchar("followee_user_id", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const userBlocks = pgTable("user_blocks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  blockerUserId: varchar("blocker_user_id", { length: 64 }).notNull(),
  blockedUserId: varchar("blocked_user_id", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

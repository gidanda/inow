import { Injectable } from "@nestjs/common";
import { and, eq, inArray, ne, or, sql } from "drizzle-orm";

import { createId } from "../common/ids";
import {
  type MapRecord,
  InMemoryStore,
  type SignupSession,
  type SpotRecord,
  type Visibility,
  type UserRecord
} from "../common/in-memory.store";
import { DatabaseService } from "../db/database.service";
import {
  authSignupSessions,
  follows,
  mapLikes,
  maps,
  mapTags,
  mapSaves,
  spots,
  spotTags,
  tags,
  userBlocks,
  users
} from "../db/schema";

@Injectable()
export class InowRepository {
  constructor(
    private readonly store: InMemoryStore,
    private readonly databaseService: DatabaseService
  ) {}

  private get db() {
    return this.databaseService.db;
  }

  private toUserRecord(row: typeof users.$inferSelect): UserRecord {
    return {
      ...row,
      birthDate: row.birthDate,
      profileImageUrl: row.profileImageUrl ?? undefined,
      bio: row.bio ?? undefined,
      createdAt: row.createdAt.toISOString()
    };
  }

  private toSignupSession(row: typeof authSignupSessions.$inferSelect): SignupSession {
    return {
      id: row.id,
      email: row.email,
      passwordDigest: row.passwordDigest,
      verificationCode: row.verificationCode,
      isVerified: row.isVerified,
      expiresAt: row.expiresAt.toISOString()
    };
  }

  private toMapRecord(row: typeof maps.$inferSelect): MapRecord {
    return {
      ...row,
      description: row.description ?? undefined,
      coverImageUrl: row.coverImageUrl ?? undefined,
      visibility: row.visibility as Visibility,
      defaultType: (row.defaultType as MapRecord["defaultType"]) ?? undefined,
      tags: [],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private toSpotRecord(row: typeof spots.$inferSelect): SpotRecord {
    return {
      ...row,
      sourceSpotId: row.sourceSpotId ?? undefined,
      googlePlaceId: row.googlePlaceId ?? undefined,
      formattedAddress: row.formattedAddress ?? undefined,
      comment: row.comment ?? undefined,
      imageUrl: row.imageUrl ?? undefined,
      tags: [],
      sourceType: row.sourceType as SpotRecord["sourceType"],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private async ensureTagIds(tagNames: string[]) {
    if (!this.db || tagNames.length === 0) {
      return [];
    }

    const normalized = [...new Set(tagNames.map((tag) => tag.trim()).filter(Boolean))];
    if (normalized.length === 0) {
      return [];
    }

    const existing = await this.db.query.tags.findMany({
      where: inArray(tags.name, normalized)
    });
    const missing = normalized.filter((name) => !existing.some((candidate) => candidate.name === name));

    if (missing.length > 0) {
      await this.db.insert(tags).values(missing.map((name) => ({ id: createId("tag"), name })));
    }

    const all = await this.db.query.tags.findMany({
      where: inArray(tags.name, normalized)
    });
    return all.map((candidate) => ({ id: candidate.id, name: candidate.name }));
  }

  private async syncMapTags(mapId: string, tagNames: string[]) {
    if (!this.db) return;
    await this.db.delete(mapTags).where(eq(mapTags.mapId, mapId));
    const tagRows = await this.ensureTagIds(tagNames);
    if (tagRows.length > 0) {
      await this.db.insert(mapTags).values(tagRows.map((tag) => ({ mapId, tagId: tag.id })));
    }
  }

  private async syncSpotTags(spotId: string, tagNames: string[]) {
    if (!this.db) return;
    await this.db.delete(spotTags).where(eq(spotTags.spotId, spotId));
    const tagRows = await this.ensureTagIds(tagNames);
    if (tagRows.length > 0) {
      await this.db.insert(spotTags).values(tagRows.map((tag) => ({ spotId, tagId: tag.id })));
    }
  }

  private async attachMapTags(records: MapRecord[]) {
    if (!this.db || records.length === 0) return records;

    const mapIds = records.map((record) => record.id);
    const rows = await this.db
      .select({
        mapId: mapTags.mapId,
        tagName: tags.name
      })
      .from(mapTags)
      .innerJoin(tags, eq(mapTags.tagId, tags.id))
      .where(inArray(mapTags.mapId, mapIds));

    const grouped = new Map<string, string[]>();
    for (const row of rows) {
      grouped.set(row.mapId, [...(grouped.get(row.mapId) ?? []), row.tagName]);
    }

    return records.map((record) => ({
      ...record,
      tags: grouped.get(record.id) ?? []
    }));
  }

  private async attachSpotTags(records: SpotRecord[]) {
    if (!this.db || records.length === 0) return records;

    const spotIds = records.map((record) => record.id);
    const rows = await this.db
      .select({
        spotId: spotTags.spotId,
        tagName: tags.name
      })
      .from(spotTags)
      .innerJoin(tags, eq(spotTags.tagId, tags.id))
      .where(inArray(spotTags.spotId, spotIds));

    const grouped = new Map<string, string[]>();
    for (const row of rows) {
      grouped.set(row.spotId, [...(grouped.get(row.spotId) ?? []), row.tagName]);
    }

    return records.map((record) => ({
      ...record,
      tags: grouped.get(record.id) ?? []
    }));
  }

  async findUserById(userId: string) {
    if (!this.db) {
      return this.store.users.find((candidate) => candidate.id === userId);
    }

    const row = await this.db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    return row ? this.toUserRecord(row) : undefined;
  }

  async findUserByIdOrUserId(userId: string) {
    if (!this.db) {
      return this.store.users.find((candidate) => candidate.id === userId || candidate.userId === userId);
    }

    const row = await this.db.query.users.findFirst({
      where: or(eq(users.id, userId), eq(users.userId, userId))
    });
    return row ? this.toUserRecord(row) : undefined;
  }

  async findUserByEmail(email: string) {
    if (!this.db) {
      return this.store.users.find((candidate) => candidate.email === email);
    }

    const row = await this.db.query.users.findFirst({
      where: eq(users.email, email)
    });
    return row ? this.toUserRecord(row) : undefined;
  }

  async hasUserId(userId: string) {
    if (!this.db) {
      return this.store.users.some((candidate) => candidate.userId === userId);
    }

    const row = await this.db.query.users.findFirst({
      where: eq(users.userId, userId),
      columns: { id: true }
    });
    return Boolean(row);
  }

  async createSignupSession(input: Omit<SignupSession, "id">) {
    const session = { id: createId("su"), ...input };

    if (!this.db) {
      this.store.signupSessions.push(session);
      return session;
    }

    const [row] = await this.db
      .insert(authSignupSessions)
      .values({
        id: session.id,
        email: session.email,
        passwordDigest: session.passwordDigest,
        verificationCode: session.verificationCode,
        isVerified: session.isVerified,
        expiresAt: new Date(session.expiresAt)
      })
      .returning();

    return this.toSignupSession(row);
  }

  async findSignupSessionById(signupSessionId: string) {
    if (!this.db) {
      return this.store.signupSessions.find((candidate) => candidate.id === signupSessionId);
    }

    const row = await this.db.query.authSignupSessions.findFirst({
      where: eq(authSignupSessions.id, signupSessionId)
    });
    return row ? this.toSignupSession(row) : undefined;
  }

  async verifySignupSession(signupSessionId: string) {
    if (!this.db) {
      const session = this.store.signupSessions.find((candidate) => candidate.id === signupSessionId);
      if (session) session.isVerified = true;
      return session;
    }

    const [row] = await this.db
      .update(authSignupSessions)
      .set({
        isVerified: true,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(authSignupSessions.id, signupSessionId))
      .returning();

    return row ? this.toSignupSession(row) : undefined;
  }

  async createUser(input: Omit<UserRecord, "id">) {
    const user = { id: createId("usr"), ...input };

    if (!this.db) {
      this.store.users.push(user);
      return user;
    }

    const [row] = await this.db
      .insert(users)
      .values({
        id: user.id,
        userId: user.userId,
        email: user.email,
        passwordDigest: user.passwordDigest,
        lastName: user.lastName,
        firstName: user.firstName,
        birthDate: user.birthDate,
        displayName: user.displayName,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio
      })
      .returning();

    return this.toUserRecord(row);
  }

  async updateUser(
    userId: string,
    input: {
      displayName?: string;
      bio?: string;
      profileImageUrl?: string;
    }
  ) {
    if (!this.db) {
      const user = this.store.users.find((candidate) => candidate.id === userId);
      if (!user) return undefined;
      user.displayName = input.displayName ?? user.displayName;
      user.bio = input.bio ?? user.bio;
      user.profileImageUrl = input.profileImageUrl ?? user.profileImageUrl;
      return user;
    }

    const [row] = await this.db
      .update(users)
      .set({
        displayName: input.displayName,
        bio: input.bio,
        profileImageUrl: input.profileImageUrl,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    return row ? this.toUserRecord(row) : undefined;
  }

  async createDefaultMapsForUser(userId: string, createdAt: string) {
    const favoriteMap = await this.createMap({
      userId,
      title: "お気に入り",
      visibility: "private",
      isDefault: true,
      defaultType: "favorite",
      tags: [],
      createdAt,
      updatedAt: createdAt
    });
    const wantToGoMap = await this.createMap({
      userId,
      title: "行きたい",
      visibility: "private",
      isDefault: true,
      defaultType: "want_to_go",
      tags: [],
      createdAt,
      updatedAt: createdAt
    });

    return [favoriteMap, wantToGoMap];
  }

  async listMapsForUser(userId: string) {
    if (!this.db) {
      return this.store.maps.filter((candidate) => candidate.userId === userId);
    }

    const rows = await this.db.query.maps.findMany({
      where: eq(maps.userId, userId)
    });
    return this.attachMapTags(rows.map((row) => this.toMapRecord(row)));
  }

  async listPublicMapsForUser(userId: string) {
    if (!this.db) {
      return this.store.maps.filter((candidate) => candidate.userId === userId && candidate.visibility === "public");
    }

    const rows = await this.db.query.maps.findMany({
      where: and(eq(maps.userId, userId), eq(maps.visibility, "public"))
    });
    return this.attachMapTags(rows.map((row) => this.toMapRecord(row)));
  }

  async listSavedMapsForUser(userId: string) {
    if (!this.db) {
      return this.store.mapSaves.filter((candidate) => candidate.userId === userId);
    }

    return this.db.query.mapSaves.findMany({
      where: eq(mapSaves.userId, userId)
    });
  }

  async listSavedOrOwnedMapsForUser(userId: string) {
    if (!this.db) {
      return this.store.maps.filter(
        (candidate) =>
          candidate.userId === userId ||
          this.store.mapSaves.some((save) => save.userId === userId && save.mapId === candidate.id)
      );
    }

    const owned = await this.listMapsForUser(userId);
    const saved = await this.listSavedMapsForUser(userId);
    const savedMapIds = saved.map((item) => item.mapId);
    const savedRows =
      savedMapIds.length > 0
        ? await this.db.query.maps.findMany({
            where: inArray(maps.id, savedMapIds)
          })
        : [];
    const merged = [...owned, ...(await this.attachMapTags(savedRows.map((row) => this.toMapRecord(row))))];
    return merged.filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index);
  }

  async findMapById(mapId: string) {
    if (!this.db) {
      return this.store.maps.find((candidate) => candidate.id === mapId);
    }

    const row = await this.db.query.maps.findFirst({
      where: eq(maps.id, mapId)
    });
    if (!row) return undefined;
    return (await this.attachMapTags([this.toMapRecord(row)]))[0];
  }

  async createMap(input: Omit<MapRecord, "id">) {
    const map = { id: createId("map"), ...input };

    if (!this.db) {
      this.store.maps.push(map);
      return map;
    }

    const [row] = await this.db
      .insert(maps)
      .values({
        id: map.id,
        userId: map.userId,
        title: map.title,
        description: map.description,
        coverImageUrl: map.coverImageUrl,
        visibility: map.visibility,
        isDefault: map.isDefault,
        defaultType: map.defaultType
      })
      .returning();
    await this.syncMapTags(row.id, map.tags);
    return (await this.attachMapTags([this.toMapRecord(row)]))[0];
  }

  async updateMap(mapId: string, updater: (map: MapRecord) => void) {
    const current = await this.findMapById(mapId);
    if (!current) return null;

    updater(current);

    if (!this.db) {
      const index = this.store.maps.findIndex((candidate) => candidate.id === mapId);
      if (index >= 0) this.store.maps[index] = current;
      return current;
    }

    const [row] = await this.db
      .update(maps)
      .set({
        title: current.title,
        description: current.description,
        coverImageUrl: current.coverImageUrl,
        visibility: current.visibility,
        updatedAt: new Date(current.updatedAt)
      })
      .where(eq(maps.id, mapId))
      .returning();
    await this.syncMapTags(mapId, current.tags);
    if (!row) return null;
    return (await this.attachMapTags([this.toMapRecord(row)]))[0];
  }

  async deleteMap(mapId: string) {
    if (!this.db) {
      this.store.maps = this.store.maps.filter((candidate) => candidate.id !== mapId);
      this.store.spots = this.store.spots.filter((candidate) => candidate.mapId !== mapId);
      return;
    }

    await this.db.delete(spots).where(eq(spots.mapId, mapId));
    await this.db.delete(mapTags).where(eq(mapTags.mapId, mapId));
    await this.db.delete(mapSaves).where(eq(mapSaves.mapId, mapId));
    await this.db.delete(mapLikes).where(eq(mapLikes.mapId, mapId));
    await this.db.delete(maps).where(eq(maps.id, mapId));
  }

  async isMapSavedByUser(mapId: string, userId?: string) {
    if (!userId) return false;
    if (!this.db) {
      return this.store.mapSaves.some((candidate) => candidate.userId === userId && candidate.mapId === mapId);
    }

    const row = await this.db.query.mapSaves.findFirst({
      where: and(eq(mapSaves.mapId, mapId), eq(mapSaves.userId, userId)),
      columns: { id: true }
    });
    return Boolean(row);
  }

  async saveMapForUser(mapId: string, userId: string) {
    if (await this.isMapSavedByUser(mapId, userId)) return;
    if (!this.db) {
      this.store.mapSaves.push({ id: createId("save"), userId, mapId });
      return;
    }

    await this.db.insert(mapSaves).values({ id: createId("save"), userId, mapId });
  }

  async unsaveMapForUser(mapId: string, userId: string) {
    if (!this.db) {
      this.store.mapSaves = this.store.mapSaves.filter(
        (candidate) => !(candidate.userId === userId && candidate.mapId === mapId)
      );
      return;
    }

    await this.db.delete(mapSaves).where(and(eq(mapSaves.userId, userId), eq(mapSaves.mapId, mapId)));
  }

  async isMapLikedByUser(mapId: string, userId?: string) {
    if (!userId) return false;
    if (!this.db) {
      return this.store.mapLikes.some((candidate) => candidate.userId === userId && candidate.mapId === mapId);
    }

    const row = await this.db.query.mapLikes.findFirst({
      where: and(eq(mapLikes.mapId, mapId), eq(mapLikes.userId, userId)),
      columns: { id: true }
    });
    return Boolean(row);
  }

  async countMapLikes(mapId: string) {
    if (!this.db) {
      return this.store.mapLikes.filter((candidate) => candidate.mapId === mapId).length;
    }

    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(mapLikes)
      .where(eq(mapLikes.mapId, mapId));
    return row?.count ?? 0;
  }

  async likeMapForUser(mapId: string, userId: string) {
    if (await this.isMapLikedByUser(mapId, userId)) return;
    if (!this.db) {
      this.store.mapLikes.push({ id: createId("like"), userId, mapId });
      return;
    }

    await this.db.insert(mapLikes).values({ id: createId("like"), userId, mapId });
  }

  async unlikeMapForUser(mapId: string, userId: string) {
    if (!this.db) {
      this.store.mapLikes = this.store.mapLikes.filter(
        (candidate) => !(candidate.userId === userId && candidate.mapId === mapId)
      );
      return;
    }

    await this.db.delete(mapLikes).where(and(eq(mapLikes.userId, userId), eq(mapLikes.mapId, mapId)));
  }

  async listSpotsForMap(mapId: string) {
    if (!this.db) {
      return this.store.spots
        .filter((candidate) => candidate.mapId === mapId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const rows = await this.db.query.spots.findMany({
      where: eq(spots.mapId, mapId),
      orderBy: (table, { asc }) => [asc(table.sortOrder)]
    });
    return this.attachSpotTags(rows.map((row) => this.toSpotRecord(row)));
  }

  async listVisibleSpots(actorId?: string) {
    if (!this.db) {
      return this.store.spots.filter((candidate) => {
        const map = this.store.maps.find((mapCandidate) => mapCandidate.id === candidate.mapId);
        return Boolean(map && (map.visibility === "public" || map.userId === actorId));
      });
    }

    if (actorId) {
      const rows = await this.db
        .select({ spot: spots })
        .from(spots)
        .innerJoin(maps, eq(spots.mapId, maps.id))
        .where(or(eq(maps.visibility, "public"), eq(maps.userId, actorId)));
      return this.attachSpotTags(rows.map((row) => this.toSpotRecord(row.spot)));
    }

    return this.listPublicSpots();
  }

  async listPublicSpots() {
    if (!this.db) {
      return this.store.spots.filter((candidate) => {
        const map = this.store.maps.find((mapCandidate) => mapCandidate.id === candidate.mapId);
        return map?.visibility === "public";
      });
    }

    const rows = await this.db
      .select({ spot: spots })
      .from(spots)
      .innerJoin(maps, eq(spots.mapId, maps.id))
      .where(eq(maps.visibility, "public"));
    return this.attachSpotTags(rows.map((row) => this.toSpotRecord(row.spot)));
  }

  async findSpotById(spotId: string) {
    if (!this.db) {
      return this.store.spots.find((candidate) => candidate.id === spotId);
    }

    const row = await this.db.query.spots.findFirst({
      where: eq(spots.id, spotId)
    });
    if (!row) return undefined;
    return (await this.attachSpotTags([this.toSpotRecord(row)]))[0];
  }

  async createSpot(input: Omit<SpotRecord, "id">) {
    const spot = { id: createId("spot"), ...input };

    if (!this.db) {
      this.store.spots.push(spot);
      return spot;
    }

    const [row] = await this.db
      .insert(spots)
      .values({
        id: spot.id,
        mapId: spot.mapId,
        createdBy: spot.createdBy,
        sourceSpotId: spot.sourceSpotId,
        sourceType: spot.sourceType,
        googlePlaceId: spot.googlePlaceId,
        formattedAddress: spot.formattedAddress,
        name: spot.name,
        comment: spot.comment,
        latitude: spot.latitude,
        longitude: spot.longitude,
        imageUrl: spot.imageUrl,
        sortOrder: spot.sortOrder
      })
      .returning();
    await this.syncSpotTags(row.id, spot.tags);
    return (await this.attachSpotTags([this.toSpotRecord(row)]))[0];
  }

  async updateSpot(spotId: string, updater: (spot: SpotRecord) => void) {
    const current = await this.findSpotById(spotId);
    if (!current) return null;

    updater(current);

    if (!this.db) {
      const index = this.store.spots.findIndex((candidate) => candidate.id === spotId);
      if (index >= 0) this.store.spots[index] = current;
      return current;
    }

    const [row] = await this.db
      .update(spots)
      .set({
        mapId: current.mapId,
        sourceType: current.sourceType,
        googlePlaceId: current.googlePlaceId,
        formattedAddress: current.formattedAddress,
        name: current.name,
        comment: current.comment,
        latitude: current.latitude,
        longitude: current.longitude,
        imageUrl: current.imageUrl,
        updatedAt: new Date(current.updatedAt)
      })
      .where(eq(spots.id, spotId))
      .returning();
    await this.syncSpotTags(spotId, current.tags);
    if (!row) return null;
    return (await this.attachSpotTags([this.toSpotRecord(row)]))[0];
  }

  async deleteSpot(spotId: string) {
    if (!this.db) {
      this.store.spots = this.store.spots.filter((candidate) => candidate.id !== spotId);
      return;
    }

    await this.db.delete(spotTags).where(eq(spotTags.spotId, spotId));
    await this.db.delete(spots).where(eq(spots.id, spotId));
  }

  async countSpotsForMap(mapId: string) {
    if (!this.db) {
      return this.store.spots.filter((candidate) => candidate.mapId === mapId).length;
    }

    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(spots)
      .where(eq(spots.mapId, mapId));
    return row?.count ?? 0;
  }

  async isFollowing(followerUserId: string, followeeUserId: string) {
    if (!this.db) {
      return this.store.follows.some(
        (candidate) => candidate.followerUserId === followerUserId && candidate.followeeUserId === followeeUserId
      );
    }

    const row = await this.db.query.follows.findFirst({
      where: and(eq(follows.followerUserId, followerUserId), eq(follows.followeeUserId, followeeUserId)),
      columns: { id: true }
    });
    return Boolean(row);
  }

  async followUser(followerUserId: string, followeeUserId: string) {
    if (await this.isFollowing(followerUserId, followeeUserId)) return;
    if (!this.db) {
      this.store.follows.push({ id: createId("follow"), followerUserId, followeeUserId });
      return;
    }

    await this.db.insert(follows).values({ id: createId("follow"), followerUserId, followeeUserId });
  }

  async unfollowUser(followerUserId: string, followeeUserId: string) {
    if (!this.db) {
      this.store.follows = this.store.follows.filter(
        (candidate) =>
          !(candidate.followerUserId === followerUserId && candidate.followeeUserId === followeeUserId)
      );
      return;
    }

    await this.db
      .delete(follows)
      .where(and(eq(follows.followerUserId, followerUserId), eq(follows.followeeUserId, followeeUserId)));
  }

  async listFolloweesForUser(userId: string) {
    if (!this.db) {
      return this.store.follows.filter((candidate) => candidate.followerUserId === userId);
    }

    return this.db.query.follows.findMany({
      where: eq(follows.followerUserId, userId)
    });
  }

  async areUsersBlocked(actorId: string, otherUserId?: string) {
    if (!otherUserId) return false;
    if (!this.db) {
      return this.store.blocks.some(
        (candidate) =>
          (candidate.blockerUserId === actorId && candidate.blockedUserId === otherUserId) ||
          (candidate.blockerUserId === otherUserId && candidate.blockedUserId === actorId)
      );
    }

    const row = await this.db.query.userBlocks.findFirst({
      where: or(
        and(eq(userBlocks.blockerUserId, actorId), eq(userBlocks.blockedUserId, otherUserId)),
        and(eq(userBlocks.blockerUserId, otherUserId), eq(userBlocks.blockedUserId, actorId))
      ),
      columns: { id: true }
    });
    return Boolean(row);
  }

  async listBlockedUsers(userId: string) {
    if (!this.db) {
      return this.store.blocks.filter((candidate) => candidate.blockerUserId === userId);
    }

    return this.db.query.userBlocks.findMany({
      where: eq(userBlocks.blockerUserId, userId)
    });
  }

  async isBlocked(blockerUserId: string, blockedUserId: string) {
    if (!this.db) {
      return this.store.blocks.some(
        (candidate) => candidate.blockerUserId === blockerUserId && candidate.blockedUserId === blockedUserId
      );
    }

    const row = await this.db.query.userBlocks.findFirst({
      where: and(eq(userBlocks.blockerUserId, blockerUserId), eq(userBlocks.blockedUserId, blockedUserId)),
      columns: { id: true }
    });
    return Boolean(row);
  }

  async blockUser(blockerUserId: string, blockedUserId: string) {
    if (await this.isBlocked(blockerUserId, blockedUserId)) return;
    if (!this.db) {
      this.store.blocks.push({ id: createId("block"), blockerUserId, blockedUserId });
      return;
    }

    await this.db.insert(userBlocks).values({ id: createId("block"), blockerUserId, blockedUserId });
  }

  async unblockUser(blockerUserId: string, blockedUserId: string) {
    if (!this.db) {
      this.store.blocks = this.store.blocks.filter(
        (candidate) =>
          !(candidate.blockerUserId === blockerUserId && candidate.blockedUserId === blockedUserId)
      );
      return;
    }

    await this.db
      .delete(userBlocks)
      .where(and(eq(userBlocks.blockerUserId, blockerUserId), eq(userBlocks.blockedUserId, blockedUserId)));
  }

  async listUsers() {
    if (!this.db) {
      return this.store.users;
    }

    const rows = await this.db.query.users.findMany();
    return rows.map((row) => this.toUserRecord(row));
  }

  async listPublicMapsExcludingUser(userId?: string) {
    if (!this.db) {
      return this.store.maps.filter(
        (candidate) => candidate.visibility === "public" && candidate.userId !== userId
      );
    }

    const whereClause = userId
      ? and(eq(maps.visibility, "public"), ne(maps.userId, userId))
      : eq(maps.visibility, "public");
    const rows = await this.db.query.maps.findMany({
      where: whereClause
    });
    return this.attachMapTags(rows.map((row) => this.toMapRecord(row)));
  }
}

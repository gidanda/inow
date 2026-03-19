import { Injectable } from "@nestjs/common";

import { InowRepository } from "../../data-access/inow.repository";

@Injectable()
export class MapsService {
  constructor(private readonly repository: InowRepository) {}

  async getMap(mapId: string, actorId?: string) {
    const map = await this.repository.findMapById(mapId);
    if (!map) return { error: { code: "MAP_NOT_FOUND", message: "Map not found" } };
    if (map.visibility === "private" && map.userId !== actorId) return { error: { code: "FORBIDDEN", message: "Map is private" } };
    const owner = await this.repository.findUserById(map.userId);
    return {
      id: map.id,
      title: map.title,
      description: map.description,
      cover_image_url: map.coverImageUrl,
      visibility: map.visibility,
      is_saved: await this.repository.isMapSavedByUser(map.id, actorId),
      is_liked: await this.repository.isMapLikedByUser(map.id, actorId),
      like_count: await this.repository.countMapLikes(map.id),
      owner: owner ? { id: owner.id, user_id: owner.userId, display_name: owner.displayName } : null,
      tags: map.tags,
      spots: (await this.repository.listSpotsForMap(map.id)).map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        latitude: candidate.latitude,
        longitude: candidate.longitude
      }))
    };
  }

  async createMap(actorId: string, input: { title: string; description?: string; cover_image_url?: string; tags: string[]; visibility: "public" | "private" }) {
    const now = new Date().toISOString();
    const map = await this.repository.createMap({
      userId: actorId,
      title: input.title,
      description: input.description,
      coverImageUrl: input.cover_image_url,
      visibility: input.visibility,
      isDefault: false,
      tags: input.tags,
      createdAt: now,
      updatedAt: now
    });
    return { id: map.id, title: map.title, visibility: map.visibility };
  }

  async updateMap(mapId: string, actorId: string, input: { title?: string; description?: string; cover_image_url?: string; tags?: string[]; visibility?: "public" | "private" }) {
    const map = await this.repository.findMapById(mapId);
    if (!map) return { error: { code: "MAP_NOT_FOUND", message: "Map not found" } };
    if (map.userId !== actorId) return { error: { code: "FORBIDDEN", message: "Cannot edit this map" } };
    if (map.isDefault && (input.title || input.description || input.cover_image_url)) {
      return { error: { code: "DEFAULT_MAP_RESTRICTED", message: "Default map fields are restricted" } };
    }
    const updated = await this.repository.updateMap(mapId, (candidate) => {
      candidate.title = input.title ?? candidate.title;
      candidate.description = candidate.isDefault ? undefined : input.description ?? candidate.description;
      candidate.coverImageUrl = candidate.isDefault ? undefined : input.cover_image_url ?? candidate.coverImageUrl;
      candidate.visibility = candidate.isDefault ? "private" : input.visibility ?? candidate.visibility;
      candidate.tags = input.tags ?? candidate.tags;
      candidate.updatedAt = new Date().toISOString();
    });
    return { id: updated?.id ?? map.id, title: updated?.title ?? map.title, visibility: updated?.visibility ?? map.visibility };
  }

  async deleteMap(mapId: string, actorId: string) {
    const map = await this.repository.findMapById(mapId);
    if (!map) return { error: { code: "MAP_NOT_FOUND", message: "Map not found" } };
    if (map.userId !== actorId) return { error: { code: "FORBIDDEN", message: "Cannot delete this map" } };
    if (map.isDefault) return { error: { code: "DEFAULT_MAP_RESTRICTED", message: "Default maps cannot be deleted" } };
    await this.repository.deleteMap(mapId);
    return { success: true };
  }

  async saveMap(mapId: string, actorId: string) {
    const map = await this.repository.findMapById(mapId);
    if (!map) return { error: { code: "MAP_NOT_FOUND", message: "Map not found" } };
    if (map.userId === actorId) return { error: { code: "OWN_MAP_NOT_SAVEABLE", message: "Own map cannot be saved" } };
    await this.repository.saveMapForUser(mapId, actorId);
    return { map_id: mapId, saved: true };
  }

  async unsaveMap(mapId: string, actorId: string) {
    await this.repository.unsaveMapForUser(mapId, actorId);
    return { map_id: mapId, saved: false };
  }

  async likeMap(mapId: string, actorId: string) {
    await this.repository.likeMapForUser(mapId, actorId);
    return { map_id: mapId, liked: true };
  }

  async unlikeMap(mapId: string, actorId: string) {
    await this.repository.unlikeMapForUser(mapId, actorId);
    return { map_id: mapId, liked: false };
  }

  async getMyMaps(actorId: string) {
    return (await this.repository.listSavedOrOwnedMapsForUser(actorId)).map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      visibility: candidate.visibility,
      is_default: candidate.isDefault,
      default_type: candidate.defaultType ?? null,
      type: candidate.userId === actorId ? (candidate.isDefault ? "default" : "owned") : "saved"
    }));
  }

  async getUserMaps(userId: string) {
    const user = await this.repository.findUserByIdOrUserId(userId);
    if (!user) return { error: { code: "USER_NOT_FOUND", message: "User not found" } };
    return (await this.repository.listPublicMapsForUser(user.id)).map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      tags: candidate.tags
    }));
  }
}

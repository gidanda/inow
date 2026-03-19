import { Injectable } from "@nestjs/common";

import { InowRepository } from "../../data-access/inow.repository";

@Injectable()
export class SpotsService {
  constructor(private readonly repository: InowRepository) {}

  async getSpot(spotId: string, actorId?: string) {
    const spot = await this.repository.findSpotById(spotId);
    if (!spot) return { error: { code: "SPOT_NOT_FOUND", message: "Spot not found" } };
    const map = await this.repository.findMapById(spot.mapId);
    if (!map) return { error: { code: "MAP_NOT_FOUND", message: "Map not found" } };
    if (map.visibility === "private" && map.userId !== actorId) return { error: { code: "FORBIDDEN", message: "Spot is private" } };
    const owner = await this.repository.findUserById(spot.createdBy);
    return {
      id: spot.id,
      name: spot.name,
      comment: spot.comment,
      source_type: spot.sourceType,
      google_place_id: spot.googlePlaceId,
      formatted_address: spot.formattedAddress,
      latitude: spot.latitude,
      longitude: spot.longitude,
      image_url: spot.imageUrl,
      tags: spot.tags,
      map: {
        id: map.id,
        title: map.title
      },
      owner: owner ? { id: owner.id, user_id: owner.userId, display_name: owner.displayName } : null
    };
  }

  async createSpot(actorId: string, input: { map_id: string; source_type: "google_place" | "manual"; google_place_id?: string; name: string; comment?: string; formatted_address?: string; latitude: number; longitude: number; image_url?: string; tags: string[] }) {
    const map = await this.repository.findMapById(input.map_id);
    if (!map || map.userId !== actorId) return { error: { code: "FORBIDDEN", message: "Cannot add to this map" } };
    const createdAt = new Date().toISOString();
    const sortOrder = (await this.repository.countSpotsForMap(map.id)) + 1;
    const spot = await this.repository.createSpot({
      mapId: input.map_id,
      createdBy: actorId,
      sourceType: input.source_type,
      googlePlaceId: input.google_place_id,
      formattedAddress: input.formatted_address,
      name: input.name,
      comment: input.comment,
      latitude: input.latitude,
      longitude: input.longitude,
      imageUrl: input.image_url,
      tags: input.tags,
      sortOrder,
      createdAt,
      updatedAt: createdAt
    });
    return { id: spot.id, map_id: spot.mapId, name: spot.name };
  }

  async updateSpot(spotId: string, actorId: string, input: { map_id?: string; source_type?: "google_place" | "manual"; google_place_id?: string; name?: string; comment?: string; formatted_address?: string; latitude?: number; longitude?: number; image_url?: string; tags?: string[] }) {
    const spot = await this.repository.findSpotById(spotId);
    if (!spot) return { error: { code: "SPOT_NOT_FOUND", message: "Spot not found" } };
    if (spot.createdBy !== actorId) return { error: { code: "FORBIDDEN", message: "Cannot edit this spot" } };
    const updated = await this.repository.updateSpot(spotId, (candidate) => {
      candidate.mapId = input.map_id ?? candidate.mapId;
      candidate.sourceType = input.source_type ?? candidate.sourceType;
      candidate.googlePlaceId = input.google_place_id ?? candidate.googlePlaceId;
      candidate.formattedAddress = input.formatted_address ?? candidate.formattedAddress;
      candidate.name = input.name ?? candidate.name;
      candidate.comment = input.comment ?? candidate.comment;
      candidate.latitude = input.latitude ?? candidate.latitude;
      candidate.longitude = input.longitude ?? candidate.longitude;
      candidate.imageUrl = input.image_url ?? candidate.imageUrl;
      candidate.tags = input.tags ?? candidate.tags;
      candidate.updatedAt = new Date().toISOString();
    });
    return { id: updated?.id ?? spot.id, name: updated?.name ?? spot.name };
  }

  async deleteSpot(spotId: string, actorId: string) {
    const spot = await this.repository.findSpotById(spotId);
    if (!spot) return { error: { code: "SPOT_NOT_FOUND", message: "Spot not found" } };
    if (spot.createdBy !== actorId) return { error: { code: "FORBIDDEN", message: "Cannot delete this spot" } };
    await this.repository.deleteSpot(spotId);
    return { success: true };
  }

  async copySpot(spotId: string, targetMapId: string, actorId: string) {
    const source = await this.repository.findSpotById(spotId);
    const targetMap = await this.repository.findMapById(targetMapId);
    if (!source || !targetMap || targetMap.userId !== actorId) return { error: { code: "FORBIDDEN", message: "Cannot copy to this map" } };
    const createdAt = new Date().toISOString();
    const createdSpot = await this.repository.createSpot({
      ...source,
      mapId: targetMap.id,
      createdBy: actorId,
      sourceSpotId: source.id,
      sourceType: "copied_spot",
      sortOrder: (await this.repository.countSpotsForMap(targetMap.id)) + 1,
      createdAt,
      updatedAt: createdAt
    });
    return {
      source_spot_id: source.id,
      target_map_id: targetMap.id,
      created_spot_id: createdSpot.id
    };
  }
}

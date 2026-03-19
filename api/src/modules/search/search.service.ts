import { Injectable } from "@nestjs/common";

import { InowRepository } from "../../data-access/inow.repository";

@Injectable()
export class SearchService {
  constructor(private readonly repository: InowRepository) {}

  async search(query: Record<string, string>, actorId?: string) {
    const q = query.q?.toLowerCase() ?? "";
    const visibleMaps = await this.repository.listPublicMapsExcludingUser(actorId);
    const maps = visibleMaps
      .filter((candidate) => !q || candidate.title.toLowerCase().includes(q) || candidate.tags.some((tag) => tag.toLowerCase().includes(q)))
      .map((candidate) => ({ id: candidate.id, title: candidate.title }));
    const spots = (await this.repository.listPublicSpots())
      .filter((candidate) => !q || candidate.name.toLowerCase().includes(q))
      .map((candidate) => ({ id: candidate.id, name: candidate.name }));
    const users = (await this.repository.listUsers())
      .filter((candidate) => !q || candidate.displayName.toLowerCase().includes(q) || candidate.userId.toLowerCase().includes(q))
      .map((candidate) => ({
        id: candidate.id,
        user_id: candidate.userId,
        display_name: candidate.displayName
      }));

    return { maps, spots, users, page: 1, per_page: 20, query };
  }

  async getMapSpots(actorId?: string) {
    return (await this.repository.listVisibleSpots(actorId)).map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      formatted_address: candidate.formattedAddress,
      source_type: candidate.sourceType
    }));
  }
}

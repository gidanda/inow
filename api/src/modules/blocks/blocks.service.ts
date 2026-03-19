import { Injectable } from "@nestjs/common";

import { InowRepository } from "../../data-access/inow.repository";

@Injectable()
export class BlocksService {
  constructor(private readonly repository: InowRepository) {}

  async getBlocks(actorId: string) {
    return {
      blocks: (await this.repository.listBlockedUsers(actorId)).map((candidate) => ({ user_id: candidate.blockedUserId }))
    };
  }

  async createBlock(targetUserId: string, actorId: string) {
    const blockedUser = await this.repository.findUserByIdOrUserId(targetUserId);
    if (!blockedUser) return { error: { code: "USER_NOT_FOUND", message: "User not found" } };
    await this.repository.blockUser(actorId, blockedUser.id);
    return { blocked: true, user_id: blockedUser.id };
  }

  async deleteBlock(targetUserId: string, actorId: string) {
    await this.repository.unblockUser(actorId, targetUserId);
    return { blocked: false, user_id: targetUserId };
  }
}

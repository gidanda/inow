import { Injectable } from "@nestjs/common";

import { InowRepository } from "../../data-access/inow.repository";

@Injectable()
export class UsersService {
  constructor(private readonly repository: InowRepository) {}

  async getMe(actorId: string) {
    const user = await this.repository.findUserById(actorId);
    const userMaps = (await this.repository.listMapsForUser(user?.id ?? "")).filter((candidate) => !candidate.isDefault);
    const savedMaps = await this.repository.listSavedMapsForUser(user?.id ?? "");

    return {
      id: user?.id,
      user_id: user?.userId,
      display_name: user?.displayName,
      bio: user?.bio,
      profile_image_url: user?.profileImageUrl,
      map_count: userMaps.length,
      saved_map_count: savedMaps.length,
      top_areas: [],
      top_tags: []
    };
  }

  async getUser(userId: string, actorId?: string) {
    const user = await this.repository.findUserByIdOrUserId(userId);
    const isBlocked = actorId ? await this.repository.areUsersBlocked(actorId, user?.id) : false;

    if (!user || isBlocked) {
      return {
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found"
        }
      };
    }

    return {
      id: user.id,
      user_id: user.userId,
      display_name: user.displayName,
      bio: user.bio,
      profile_image_url: user.profileImageUrl,
      is_following: Boolean(actorId && (await this.repository.isFollowing(actorId, user.id))),
      top_areas: [],
      top_tags: [],
      public_maps: (await this.repository.listPublicMapsForUser(user.id)).map((candidate) => ({
        id: candidate.id,
        title: candidate.title
      }))
    };
  }

  async followUser(targetUserId: string, actorId: string) {
    const targetUser = await this.repository.findUserByIdOrUserId(targetUserId);
    if (!targetUser || targetUser.id === actorId) {
      return {
        error: {
          code: "FOLLOW_NOT_ALLOWED",
          message: "Follow is not allowed"
        }
      };
    }

    await this.repository.followUser(actorId, targetUser.id);

    return { followed: true, user_id: targetUser.id };
  }

  async unfollowUser(targetUserId: string, actorId: string) {
    const targetUser = await this.repository.findUserByIdOrUserId(targetUserId);
    if (targetUser) {
      await this.repository.unfollowUser(actorId, targetUser.id);
    }
    return { followed: false, user_id: targetUser?.id ?? targetUserId };
  }

  async getFollows(actorId: string) {
    const followees = await this.repository.listFolloweesForUser(actorId);
    return Promise.all(
      followees
        .filter((candidate) => candidate.followerUserId === actorId)
        .map(async (candidate) => {
          const user = await this.repository.findUserById(candidate.followeeUserId);
          const latestMap = (await this.repository.listPublicMapsForUser(candidate.followeeUserId))[0];
          return {
            id: user?.id,
            user_id: user?.userId,
            display_name: user?.displayName,
            bio: user?.bio,
            recent_public_map_title: latestMap?.title ?? null
          };
        })
    );
  }

  async updateMe(
    actorId: string,
    input: {
      display_name?: string;
      bio?: string;
      profile_image_url?: string;
    }
  ) {
    const user = await this.repository.findUserById(actorId);
    if (!user) {
      return {
        error: { code: "USER_NOT_FOUND", message: "User not found" }
      };
    }

    const updatedUser = await this.repository.updateUser(actorId, {
      displayName: input.display_name,
      bio: input.bio,
      profileImageUrl: input.profile_image_url
    });

    return {
      id: updatedUser?.id ?? user.id,
      user_id: updatedUser?.userId ?? user.userId,
      display_name: updatedUser?.displayName ?? user.displayName,
      bio: updatedUser?.bio ?? user.bio,
      profile_image_url: updatedUser?.profileImageUrl ?? user.profileImageUrl
    };
  }
}

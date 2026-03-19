import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { z } from "zod";

import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { parseBody } from "../../common/validation";
import { UsersService } from "./users.service";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@CurrentUser() currentUser: AuthUser | null) {
    return this.usersService.getMe(currentUser?.id ?? "usr_hanako");
  }

  @Get("users/:userId")
  getUser(@Param("userId") userId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.usersService.getUser(userId, currentUser?.id);
  }

  @Post("users/:userId/follow")
  followUser(@Param("userId") userId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.usersService.followUser(userId, currentUser?.id ?? "usr_hanako");
  }

  @Delete("users/:userId/follow")
  unfollowUser(@Param("userId") userId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.usersService.unfollowUser(userId, currentUser?.id ?? "usr_hanako");
  }

  @Get("me/follows")
  getFollows(@CurrentUser() currentUser: AuthUser | null) {
    return this.usersService.getFollows(currentUser?.id ?? "usr_hanako");
  }

  @Patch("me")
  updateMe(@CurrentUser() currentUser: AuthUser | null, @Body() body: Record<string, unknown>) {
    const input = parseBody(
      z.object({
        display_name: z.string().min(1).max(30).optional(),
        bio: z.string().max(500).optional(),
        profile_image_url: z.string().optional()
      }),
      body
    );

    return this.usersService.updateMe(currentUser?.id ?? "usr_hanako", input);
  }
}

import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { z } from "zod";

import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { parseBody } from "../../common/validation";
import { BlocksService } from "./blocks.service";

@Controller("me/blocks")
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  getBlocks(@CurrentUser() currentUser: AuthUser | null) {
    return this.blocksService.getBlocks(currentUser?.id ?? "usr_hanako");
  }

  @Post()
  createBlock(@Body() body: Record<string, unknown>, @CurrentUser() currentUser: AuthUser | null) {
    const input = parseBody(z.object({ user_id: z.string().min(1) }), body);
    return this.blocksService.createBlock(input.user_id, currentUser?.id ?? "usr_hanako");
  }

  @Delete(":userId")
  deleteBlock(@Param("userId") userId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.blocksService.deleteBlock(userId, currentUser?.id ?? "usr_hanako");
  }
}

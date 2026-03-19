import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { z } from "zod";

import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { parseBody } from "../../common/validation";
import { MapsService } from "./maps.service";

const mapSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  cover_image_url: z.string().optional(),
  tags: z.array(z.string()).max(10).optional().default([]),
  visibility: z.enum(["public", "private"])
});

@Controller("maps")
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get(":mapId")
  getMap(@Param("mapId") mapId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.mapsService.getMap(mapId, currentUser?.id);
  }

  @Post()
  createMap(@Body() body: Record<string, unknown>, @CurrentUser() currentUser: AuthUser | null) {
    const input = parseBody(mapSchema, body);
    return this.mapsService.createMap(currentUser?.id ?? "usr_hanako", input);
  }

  @Patch(":mapId")
  updateMap(@Param("mapId") mapId: string, @Body() body: Record<string, unknown>, @CurrentUser() currentUser: AuthUser | null) {
    const input = parseBody(mapSchema.partial(), body);
    return this.mapsService.updateMap(mapId, currentUser?.id ?? "usr_hanako", input);
  }

  @Delete(":mapId")
  deleteMap(@Param("mapId") mapId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.mapsService.deleteMap(mapId, currentUser?.id ?? "usr_hanako");
  }

  @Post(":mapId/save")
  saveMap(@Param("mapId") mapId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.mapsService.saveMap(mapId, currentUser?.id ?? "usr_hanako");
  }

  @Delete(":mapId/save")
  unsaveMap(@Param("mapId") mapId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.mapsService.unsaveMap(mapId, currentUser?.id ?? "usr_hanako");
  }

  @Post(":mapId/like")
  likeMap(@Param("mapId") mapId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.mapsService.likeMap(mapId, currentUser?.id ?? "usr_hanako");
  }

  @Delete(":mapId/like")
  unlikeMap(@Param("mapId") mapId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.mapsService.unlikeMap(mapId, currentUser?.id ?? "usr_hanako");
  }
}

@Controller()
export class MyMapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get("me/maps")
  getMyMaps(@CurrentUser() currentUser: AuthUser | null) {
    return this.mapsService.getMyMaps(currentUser?.id ?? "usr_hanako");
  }

  @Get("users/:userId/maps")
  getUserMaps(@Param("userId") userId: string) {
    return this.mapsService.getUserMaps(userId);
  }
}

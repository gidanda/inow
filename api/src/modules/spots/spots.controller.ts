import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { z } from "zod";

import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { parseBody } from "../../common/validation";
import { SpotsService } from "./spots.service";

const spotSchema = z.object({
  map_id: z.string().min(1),
  source_type: z.enum(["google_place", "manual"]),
  google_place_id: z.string().optional(),
  name: z.string().min(1).max(100),
  comment: z.string().max(500).optional(),
  formatted_address: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  image_url: z.string().optional(),
  tags: z.array(z.string()).max(10).optional().default([])
});

@Controller("spots")
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get(":spotId")
  getSpot(@Param("spotId") spotId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.spotsService.getSpot(spotId, currentUser?.id);
  }

  @Post()
  createSpot(@Body() body: Record<string, unknown>, @CurrentUser() currentUser: AuthUser | null) {
    const input = parseBody(spotSchema, body);
    return this.spotsService.createSpot(currentUser?.id ?? "usr_hanako", input);
  }

  @Patch(":spotId")
  updateSpot(@Param("spotId") spotId: string, @Body() body: Record<string, unknown>, @CurrentUser() currentUser: AuthUser | null) {
    const input = parseBody(spotSchema.partial(), body);
    return this.spotsService.updateSpot(spotId, currentUser?.id ?? "usr_hanako", input);
  }

  @Delete(":spotId")
  deleteSpot(@Param("spotId") spotId: string, @CurrentUser() currentUser: AuthUser | null) {
    return this.spotsService.deleteSpot(spotId, currentUser?.id ?? "usr_hanako");
  }

  @Post(":spotId/copy")
  copySpot(@Param("spotId") spotId: string, @Body() body: Record<string, unknown>, @CurrentUser() currentUser: AuthUser | null) {
    const input = parseBody(z.object({ target_map_id: z.string().min(1) }), body);
    return this.spotsService.copySpot(spotId, input.target_map_id, currentUser?.id ?? "usr_hanako");
  }
}

import { Controller, Get, Query } from "@nestjs/common";

import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() query: Record<string, string>, @CurrentUser() currentUser: AuthUser | null) {
    return this.searchService.search(query, currentUser?.id);
  }
}

@Controller("map")
export class MapQueryController {
  constructor(private readonly searchService: SearchService) {}

  @Get("spots")
  getMapSpots(@CurrentUser() currentUser: AuthUser | null) {
    return this.searchService.getMapSpots(currentUser?.id);
  }
}

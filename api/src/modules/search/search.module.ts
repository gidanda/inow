import { Module } from "@nestjs/common";

import { MapQueryController, SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  controllers: [SearchController, MapQueryController],
  providers: [SearchService]
})
export class SearchModule {}

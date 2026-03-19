import { Module } from "@nestjs/common";

import { MapsController, MyMapsController } from "./maps.controller";
import { MapsService } from "./maps.service";

@Module({
  controllers: [MapsController, MyMapsController],
  providers: [MapsService]
})
export class MapsModule {}

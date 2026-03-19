import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { HealthModule } from "./common/health.module";
import { MockAuthGuard } from "./common/mock-auth.guard";
import { DataAccessModule } from "./data-access/data-access.module";
import { DatabaseModule } from "./db/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BlocksModule } from "./modules/blocks/blocks.module";
import { MapsModule } from "./modules/maps/maps.module";
import { PlacesModule } from "./modules/places/places.module";
import { SearchModule } from "./modules/search/search.module";
import { SpotsModule } from "./modules/spots/spots.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    DatabaseModule,
    DataAccessModule,
    HealthModule,
    AuthModule,
    UsersModule,
    MapsModule,
    PlacesModule,
    SpotsModule,
    SearchModule,
    BlocksModule,
    UploadsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: MockAuthGuard
    }
  ]
})
export class AppModule {}

import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { InMemoryStore } from "./in-memory.store";
import { MockAuthGuard } from "./mock-auth.guard";

@Module({
  controllers: [HealthController],
  providers: [InMemoryStore, MockAuthGuard],
  exports: [InMemoryStore, MockAuthGuard]
})
export class HealthModule {}

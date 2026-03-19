import { Global, Module } from "@nestjs/common";

import { InMemoryStore } from "../common/in-memory.store";
import { InowRepository } from "./inow.repository";

@Global()
@Module({
  providers: [InMemoryStore, InowRepository],
  exports: [InMemoryStore, InowRepository]
})
export class DataAccessModule {}

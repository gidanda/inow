import { Controller, Get } from "@nestjs/common";

import { DatabaseService } from "../db/database.service";

@Controller("health")
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getHealth() {
    const database = await this.databaseService.ping();

    return {
      status: "ok",
      service: "inow-api",
      database
    };
  }
}

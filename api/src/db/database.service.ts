import { Injectable, OnModuleDestroy } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "./schema";
import { getDatabaseClient } from "./client";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly client = getDatabaseClient();

  get isConfigured() {
    return Boolean(this.client);
  }

  get db(): NodePgDatabase<typeof schema> | null {
    return this.client?.db ?? null;
  }

  async ping() {
    if (!this.client) {
      return {
        configured: false,
        status: "disabled" as const
      };
    }

    await this.client.pool.query("select 1");

    return {
      configured: true,
      status: "ok" as const
    };
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.pool.end();
    }
  }
}


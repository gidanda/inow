declare module "pg" {
  export class Pool {
    constructor(config?: { connectionString?: string });
    query(sql: string): Promise<unknown>;
    end(): Promise<void>;
  }
}

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { InowRepository } from "../data-access/inow.repository";

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(private readonly repository: InowRepository) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers["x-user-id"];
    const authorization = request.headers.authorization;
    const bearerToken =
      typeof authorization === "string" && authorization.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : null;

    const identity = typeof userId === "string" ? userId : bearerToken;

    if (typeof identity === "string") {
      const user = await this.repository.findUserByIdOrUserId(identity);
      if (user) {
        request.authUser = {
          id: user.id,
          userId: user.userId,
          displayName: user.displayName
        };
      }
    }

    return true;
  }
}

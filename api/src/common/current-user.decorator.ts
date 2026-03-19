import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { AuthUser } from "./auth-user";

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser | null => {
  const request = ctx.switchToHttp().getRequest();
  return request.authUser ?? null;
});


import { BadRequestException } from "@nestjs/common";
import { ZodSchema } from "zod";

export function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new BadRequestException({
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        reason: issue.message
      }))
    });
  }

  return result.data;
}


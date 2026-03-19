import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GOOGLE_MAPS_API_KEY: z.string().min(1),
  GOOGLE_PLACES_API_KEY: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1)
});

export function getEnv() {
  return envSchema.parse(process.env);
}


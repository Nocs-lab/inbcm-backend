import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import { z } from 'zod';

dotenv.config()

const parsedEnv = {}

const parsed = {
  NODE_ENV: process.env.NODE_ENV ?? "DEVELOPMENT",
  DB_USER: process.env.DB_USER ?? "",
  DB_PASS: process.env.DB_PASS ?? "",
  DB_URL: process.env.DB_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "__SeCrEt__",
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL ?? "https://localhost:5174",
  ADMIN_SITE_URL: process.env.PRIVATE_SITE_URL ?? "https://localhost:5173",
}

// @ts-ignore
expand({ parsed, processEnv: parsedEnv })

const schema = z.object({
  NODE_ENV: z.enum(["DEVELOPMENT", "PRODUCTION"]),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().min(1),
  DB_URL: z.string().min(1).url(),
  JWT_SECRET: z.string().min(1),
  PUBLIC_SITE_URL: z.string().min(1).url(),
  ADMIN_SITE_URL: z.string().min(1).url(),
})

const config = schema.parse(parsedEnv)

export default config

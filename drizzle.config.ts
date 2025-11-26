import type { Config } from "drizzle-kit"

import { env } from "@/env"

export default {
	out: "./supabase/migrations",
	schema: "./src/server/db/schemas",
	dialect: "postgresql",
	dbCredentials: {
		url: env.SUPABASE_DB_URL,
	},
} satisfies Config

// ===================================================================
// Database Connection
// ===================================================================

import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js"
import { getEnvironmentVariables } from "./env.ts"

/**
 * Create a database connection
 * Reusable across all edge functions
 */
export function createDatabaseConnection() {
	const { databaseUrl } = getEnvironmentVariables()
	return postgres(databaseUrl)
}

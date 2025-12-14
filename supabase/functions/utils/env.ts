/**
 * Environment variables utilities
 * Reusable across all edge functions
 */

export type EnvironmentVariables = {
	supabaseUrl: string
	supabaseServiceKey: string
	databaseUrl: string
	geminiApiKey: string
	aiModel: string
}

/**
 * Get and validate all required environment variables
 * Throws an error if any required variable is missing
 */
export function getEnvironmentVariables(): EnvironmentVariables {
	const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
	const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
	const databaseUrl = Deno.env.get("SUPABASE_DB_URL") ?? ""
	const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? ""
	const aiModel = Deno.env.get("AI_MODEL") ?? ""

	if (
		!supabaseUrl ||
		!supabaseServiceKey ||
		!databaseUrl ||
		!geminiApiKey ||
		!aiModel
	) {
		throw new Error("Missing required environment variables")
	}

	return {
		supabaseUrl,
		supabaseServiceKey,
		databaseUrl,
		geminiApiKey,
		aiModel,
	}
}

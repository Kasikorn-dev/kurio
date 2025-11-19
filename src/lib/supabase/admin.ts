import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/env"

/**
 * Create Supabase Admin Client with Service Role Key
 *
 * SECURITY NOTES:
 * - This function MUST only be used in server-side code (API routes, server components)
 * - NEVER import or use this in client-side code ("use client" components)
 * - The Service Role Key bypasses Row Level Security (RLS) - use with caution
 * - Always validate inputs before using admin operations
 *
 * Use this ONLY on the server-side for admin operations
 * NEVER expose Service Role Key to the client
 */
export function createSupabaseAdminClient(): SupabaseClient {
	if (typeof window !== "undefined") {
		throw new Error(
			"createSupabaseAdminClient() cannot be used in client-side code. This is a security violation.",
		)
	}

	return createClient(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.SUPABASE_SERVICE_ROLE_KEY,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	)
}

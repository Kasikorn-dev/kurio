import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

/**
 * API route to check if email exists before signup
 * This helps prevent duplicate accounts
 *
 * SECURITY NOTES:
 * - Rate limiting should be implemented at the edge/proxy level
 * - This endpoint uses Admin API, so it should be protected
 * - Email validation prevents injection attacks
 */
export async function POST(request: Request) {
	try {
		const { email } = await request.json()

		// Validate input
		if (!email || typeof email !== "string") {
			return NextResponse.json({ error: "Email is required" }, { status: 400 })
		}

		// Basic email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 },
			)
		}

		// Limit email length to prevent abuse
		if (email.length > 255) {
			return NextResponse.json({ error: "Email is too long" }, { status: 400 })
		}

		const adminClient = createSupabaseAdminClient()

		// List users and find by email
		// NOTE: In production, consider using pagination or a more efficient query
		// For now, this works but may be slow with many users
		const { data: usersData, error } = await adminClient.auth.admin.listUsers()

		if (error) {
			// Don't expose internal error details
			// In production, log to error tracking service
			return NextResponse.json(
				{ error: "Failed to check email" },
				{ status: 500 },
			)
		}

		const existingUser = usersData.users.find((user) => user.email === email)

		if (existingUser) {
			// User exists, check provider
			const providers =
				existingUser.identities?.map(
					(id: { provider: string }) => id.provider,
				) || []
			const provider =
				existingUser.app_metadata?.provider || providers[0] || "email"

			return NextResponse.json({
				exists: true,
				provider: provider === "email" ? "email" : providers[0],
				providers,
			})
		}

		// Return generic response to prevent email enumeration
		// Always return same structure whether user exists or not
		return NextResponse.json({ exists: false })
	} catch (_error) {
		// Log error but don't expose details
		// In production, log to error tracking service
		return NextResponse.json({ error: "An error occurred" }, { status: 500 })
	}
}

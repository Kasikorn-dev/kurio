/**
 * Utility functions for OAuth callback handling
 */

import type { GoTrueAdminApi, User } from "@supabase/supabase-js"

export type OAuthCallbackError = {
	type: "oauth_failed" | "account_exists" | "exchange_failed" | "unknown"
	message: string
}

/**
 * Check if exchange error is an account linking error
 */
export function isAccountLinkingError(error: Error): boolean {
	return (
		error.message.includes("already registered") ||
		error.message.includes("Email address is already registered")
	)
}

/**
 * Check if existing user has email/password provider
 */
export function hasEmailPasswordProvider(user: {
	identities?: Array<{ provider: string }> | null
}): boolean {
	return user.identities?.some((id) => id.provider === "email") ?? false
}

/**
 * Find existing user by email (excluding current user ID)
 */
export function findExistingUserByEmail(
	users: User[],
	email: string,
	excludeUserId: string,
): User | undefined {
	return users.find((user) => user.email === email && user.id !== excludeUserId)
}

/**
 * Handle duplicate account scenario
 * Returns redirect URL if duplicate found, null otherwise
 */
export async function handleDuplicateAccount(
	oauthEmail: string,
	oauthUserId: string,
	adminClient: { auth: { admin: GoTrueAdminApi } },
	supabase: { auth: { signOut: () => Promise<{ error: Error | null }> } },
	origin: string,
): Promise<string | null> {
	try {
		const { data: usersData } = await adminClient.auth.admin.listUsers()
		const existingUser = findExistingUserByEmail(
			usersData.users,
			oauthEmail,
			oauthUserId,
		)

		if (existingUser && hasEmailPasswordProvider(existingUser)) {
			// Delete duplicate OAuth user
			await adminClient.auth.admin.deleteUser(oauthUserId)

			// Sign out current session
			await supabase.auth.signOut()

			// Return redirect URL with account linking message
			const message = encodeURIComponent(
				"Your Google account email matches an existing email/password account. Please sign in with your email and password, then link your Google account in profile settings",
			)
			return `${origin}/login?info=account_linking&message=${message}`
		}
	} catch (error) {
		// Log error but don't expose details to user
		// In production, log to error tracking service
		if (error instanceof Error) {
			// Silent fail - return null to allow normal OAuth flow
		}
	}

	return null
}

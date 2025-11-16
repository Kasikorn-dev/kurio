import type { AuthError } from "@supabase/supabase-js"

const errorMap: Record<string, string> = {
	// Login errors
	"Invalid login credentials": "Invalid email or password",
	"Email not confirmed": "Please verify your email before signing in",
	"Invalid email": "Invalid email format",
	"Invalid password": "Invalid password",

	// Password errors
	"Password should be at least 6 characters":
		"Password must be at least 6 characters",
	"New password should be different from the old password":
		"New password must be different from the old password",

	// Email errors
	"Email rate limit exceeded":
		"Too many emails sent. Please wait a moment before trying again",
	"Unable to validate email address: invalid format": "Invalid email format",

	// Token errors
	"Token has expired or is invalid":
		"Reset link has expired or is invalid. Please request a new password reset link",
	"Invalid token": "Invalid or expired token. Please request a new link",
	otp_expired:
		"Reset link has expired. Please request a new password reset link",
	token_expired:
		"Reset link has expired. Please request a new password reset link",
	invalid_token:
		"Reset link is invalid. Please request a new password reset link",
	access_denied: "Reset link is invalid or expired. Please request a new link",

	// Signup errors
	"Signup is disabled":
		"Signup is temporarily disabled. Please try again later",
	"Email address is already registered":
		"This email is already registered. Please sign in instead",
	"User already registered":
		"This email is already registered. Please sign in instead",

	// OAuth errors
	"OAuth account not found":
		"OAuth account not found. Please try signing in again",
	"OAuth provider error": "Authentication failed. Please try again",
}

export function getAuthErrorMessage(
	error: AuthError | Error | null | undefined,
): string {
	if (!error) {
		return "An error occurred. Please try again"
	}

	// Check if it's a Supabase AuthError
	if ("message" in error) {
		const message = error.message

		// Check exact match first
		if (errorMap[message]) {
			return errorMap[message]
		}

		// Check partial matches
		for (const [key, value] of Object.entries(errorMap)) {
			if (message.includes(key)) {
				return value
			}
		}

		// Return original message if no match found
		return message
	}

	return "An error occurred. Please try again"
}

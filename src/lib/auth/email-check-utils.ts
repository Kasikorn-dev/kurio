/**
 * Utility functions for email checking and account validation
 */

export type CheckEmailResult =
	| { exists: false }
	| {
			exists: true
			provider: string | undefined
			providers: string[]
	  }

/**
 * Get user-friendly error message based on email check result
 */
export function getEmailCheckErrorMessage(
	checkResult: CheckEmailResult,
): string {
	if (!checkResult.exists) {
		return "Account not found. Please sign up first or check your email address."
	}

	if (checkResult.provider === "google") {
		return "This email is registered with Google. Please sign in with Google instead."
	}

	return "Invalid password. Please check your password and try again."
}

/**
 * Get user-friendly error message for signup when email exists
 */
export function getSignupEmailErrorMessage(
	checkResult: CheckEmailResult,
): string {
	if (!checkResult.exists) {
		return "This email is already registered. Please sign in instead."
	}

	const provider = checkResult.provider || "email"

	if (provider === "google") {
		return "This email is already registered with Google. Please sign in with Google instead."
	}

	return "This email is already registered. Please sign in instead."
}

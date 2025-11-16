/**
 * Utility functions for password reset flow
 * Handles parsing URL parameters and hash fragments from Supabase password reset links
 */

export type PasswordResetError = {
	hasError: boolean
	message: string
}

export type PasswordResetHashParams = {
	accessToken: string | null
	type: string | null
	error: string | null
	errorCode: string | null
	errorDescription: string | null
}

/**
 * Parse error parameters from URL query string
 */
export function parseQueryErrors(
	searchParams: URLSearchParams,
): PasswordResetError | null {
	const error = searchParams.get("error")
	const errorCode = searchParams.get("error_code")
	const errorDescription = searchParams.get("error_description")

	if (!error && !errorCode) {
		return null
	}

	let message = "Reset link is invalid or expired. Please request a new link."

	if (errorCode === "otp_expired" || errorCode === "token_expired") {
		message =
			"Reset link has expired. Please request a new password reset link."
	} else if (errorCode === "invalid_token" || error === "access_denied") {
		message = "Reset link is invalid. Please request a new password reset link."
	} else if (errorDescription) {
		message = decodeURIComponent(errorDescription)
	}

	return {
		hasError: true,
		message,
	}
}

/**
 * Parse hash fragment from URL
 * Supabase uses hash fragments for auth callbacks: #access_token=...&type=recovery
 */
export function parseHashFragment(): PasswordResetHashParams | null {
	if (typeof window === "undefined") {
		return null
	}

	const hash = window.location.hash.substring(1)
	if (!hash) {
		return null
	}

	const hashParams = new URLSearchParams(hash)

	return {
		accessToken: hashParams.get("access_token"),
		type: hashParams.get("type"),
		error: hashParams.get("error"),
		errorCode: hashParams.get("error_code"),
		errorDescription: hashParams.get("error_description"),
	}
}

/**
 * Check if hash fragment contains error
 */
export function hasHashError(
	hashParams: PasswordResetHashParams,
): PasswordResetError | null {
	if (!hashParams.error && !hashParams.errorCode) {
		return null
	}

	let message = "Reset link is invalid or expired. Please request a new link."

	if (
		hashParams.errorCode === "otp_expired" ||
		hashParams.errorCode === "token_expired"
	) {
		message =
			"Reset link has expired. Please request a new password reset link."
	} else if (
		hashParams.errorCode === "invalid_token" ||
		hashParams.error === "access_denied"
	) {
		message = "Reset link is invalid. Please request a new password reset link."
	} else if (hashParams.errorDescription) {
		message = decodeURIComponent(hashParams.errorDescription)
	}

	return {
		hasError: true,
		message,
	}
}

/**
 * Check if hash fragment contains valid recovery token
 */
export function isValidRecoveryToken(
	hashParams: PasswordResetHashParams,
): boolean {
	return (
		hashParams.accessToken !== null &&
		hashParams.type === "recovery" &&
		!hashParams.error &&
		!hashParams.errorCode
	)
}

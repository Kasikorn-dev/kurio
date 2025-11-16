import { NextResponse } from "next/server"

/**
 * API route to handle password reset callback from Supabase
 * Supabase redirects here with hash fragment containing access_token and type
 * IMPORTANT: Hash fragments are NOT available on server-side, so we need to
 * redirect to reset-password page where client-side code handles the hash
 *
 * The hash fragment will be preserved during redirect in the browser
 */
export async function GET(request: Request) {
	const requestUrl = new URL(request.url)

	// Check for error parameters in query string
	// Supabase may send errors via query params if hash fragment processing fails
	const error = requestUrl.searchParams.get("error")
	const errorCode = requestUrl.searchParams.get("error_code")
	const errorDescription = requestUrl.searchParams.get("error_description")

	if (error || errorCode) {
		// Redirect to reset-password page with error parameters
		const errorParams = new URLSearchParams()
		if (error) errorParams.set("error", error)
		if (errorCode) errorParams.set("error_code", errorCode)
		if (errorDescription) errorParams.set("error_description", errorDescription)

		return NextResponse.redirect(
			`${requestUrl.origin}/reset-password?${errorParams.toString()}`,
		)
	}

	// If no error, redirect to reset-password page
	// The hash fragment (#access_token=...&type=recovery) will be preserved
	// and handled by client-side code in ResetPasswordForm component
	return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
}

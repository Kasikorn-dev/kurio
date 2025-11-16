import { NextResponse } from "next/server"
import {
	handleDuplicateAccount,
	isAccountLinkingError,
} from "@/lib/auth/oauth-callback-utils"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
	const requestUrl = new URL(request.url)
	const code = requestUrl.searchParams.get("code")
	const error = requestUrl.searchParams.get("error")
	const next = requestUrl.searchParams.get("next") ?? "/kurio"

	// Handle OAuth errors
	if (error) {
		return NextResponse.redirect(
			`${requestUrl.origin}/login?error=oauth_failed&message=${encodeURIComponent("Google sign-in was cancelled or failed. Please try again")}`,
		)
	}

	// Exchange code for session
	if (!code) {
		return NextResponse.redirect(`${requestUrl.origin}${next}`)
	}

	try {
		const supabase = await createServerSupabaseClient()
		const adminClient = createSupabaseAdminClient()

		// Exchange code for session
		const { data: sessionData, error: exchangeError } =
			await supabase.auth.exchangeCodeForSession(code)

		if (exchangeError) {
			if (isAccountLinkingError(exchangeError)) {
				return NextResponse.redirect(
					`${requestUrl.origin}/login?error=account_exists&message=${encodeURIComponent("This email is already registered with a different sign-in method. Please sign in with your original method")}`,
				)
			}

			// Generic error message
			return NextResponse.redirect(
				`${requestUrl.origin}/login?error=exchange_failed&message=${encodeURIComponent("Authentication failed. Please try signing in again")}`,
			)
		}

		// Handle account linking and duplicate detection
		if (sessionData.user?.email) {
			const {
				data: { user: currentUser },
			} = await supabase.auth.getUser()

			// Check if already linked
			if (
				currentUser?.id === sessionData.user.id &&
				currentUser.email === sessionData.user.email
			) {
				return NextResponse.redirect(`${requestUrl.origin}${next}`)
			}

			// Check for duplicate accounts
			const duplicateRedirect = await handleDuplicateAccount(
				sessionData.user.email,
				sessionData.user.id,
				adminClient,
				supabase,
				requestUrl.origin,
			)

			if (duplicateRedirect) {
				return NextResponse.redirect(duplicateRedirect)
			}
		}

		// Success: User authenticated, profile will be created by trigger if new user
		return NextResponse.redirect(`${requestUrl.origin}${next}`)
	} catch {
		return NextResponse.redirect(
			`${requestUrl.origin}/login?error=unknown&message=${encodeURIComponent("An unexpected error occurred during authentication. Please try again")}`,
		)
	}
}

"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
	hasHashError,
	isValidRecoveryToken,
	type PasswordResetError,
	parseHashFragment,
	parseQueryErrors,
} from "@/lib/auth/password-reset-utils"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

type PasswordResetState = {
	isCheckingSession: boolean
	error: PasswordResetError | null
	hasValidSession: boolean
}

/**
 * Custom hook for handling password reset flow
 * Manages session checking, hash fragment parsing, and error handling
 */
export function usePasswordReset(): PasswordResetState {
	const searchParams = useSearchParams()
	const [state, setState] = useState<PasswordResetState>({
		isCheckingSession: true,
		error: null,
		hasValidSession: false,
	})

	useEffect(() => {
		const supabase = createBrowserSupabaseClient()

		const initializeReset = async () => {
			// Step 1: Check query parameters for errors (from API route redirect)
			const queryError = parseQueryErrors(searchParams)
			if (queryError) {
				setState({
					isCheckingSession: false,
					error: queryError,
					hasValidSession: false,
				})
				return
			}

			// Step 2: Parse hash fragment
			const hashParams = parseHashFragment()

			if (hashParams) {
				// Step 2a: Check for errors in hash fragment
				const hashError = hasHashError(hashParams)
				if (hashError) {
					setState({
						isCheckingSession: false,
						error: hashError,
						hasValidSession: false,
					})
					return
				}

				// Step 2b: Check if hash fragment contains valid recovery token
				if (isValidRecoveryToken(hashParams)) {
					// Use onAuthStateChange to listen for PASSWORD_RECOVERY event
					const {
						data: { subscription },
					} = supabase.auth.onAuthStateChange(async (event, session) => {
						if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
							if (session) {
								setState({
									isCheckingSession: false,
									error: null,
									hasValidSession: true,
								})
								subscription.unsubscribe()
							} else {
								setState({
									isCheckingSession: false,
									error: {
										hasError: true,
										message:
											"Failed to process reset link. Please request a new password reset link.",
									},
									hasValidSession: false,
								})
								subscription.unsubscribe()
							}
						}
					})

					// Fallback: Check session after delay
					setTimeout(async () => {
						const {
							data: { session },
						} = await supabase.auth.getSession()

						if (session) {
							setState({
								isCheckingSession: false,
								error: null,
								hasValidSession: true,
							})
							subscription.unsubscribe()
						} else {
							// Check if hash fragment still exists (still processing)
							const currentHash = window.location.hash
							if (currentHash?.includes("access_token")) {
								// Still processing, don't show error yet
								setState({
									isCheckingSession: false,
									error: null,
									hasValidSession: false,
								})
								subscription.unsubscribe()
							} else {
								// Failed to process
								setState({
									isCheckingSession: false,
									error: {
										hasError: true,
										message:
											"Failed to process reset link. Please request a new password reset link.",
									},
									hasValidSession: false,
								})
								subscription.unsubscribe()
							}
						}
					}, 1000)

					return
				}
			}

			// Step 3: Check if we already have a session (user refreshed page)
			const {
				data: { session },
			} = await supabase.auth.getSession()

			setState({
				isCheckingSession: false,
				error: null,
				hasValidSession: !!session,
			})
		}

		initializeReset()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams])

	return state
}

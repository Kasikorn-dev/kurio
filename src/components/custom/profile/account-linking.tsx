"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { api } from "@/trpc/react"

export function AccountLinking() {
	const _router = useRouter()
	const { data: identities, isLoading } = api.auth.getUserIdentities.useQuery()
	const supabase = createBrowserSupabaseClient()

	const [isLinking, setIsLinking] = useState(false)

	const handleLinkGoogle = async () => {
		setIsLinking(true)

		try {
			// Use OAuth flow to link Google account
			// Supabase will automatically link if user is already authenticated
			const { error: oauthError } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/api/auth/callback?next=/profile/edit`,
					queryParams: {
						access_type: "offline",
						prompt: "consent",
					},
				},
			})

			if (oauthError) {
				toast.error("Failed to start Google account linking. Please try again")
				setIsLinking(false)
			}
			// If successful, user will be redirected to OAuth callback
			// which will handle the linking automatically
		} catch {
			toast.error(
				"An unexpected error occurred while linking account. Please try again",
			)
			setIsLinking(false)
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center gap-2">
				<Spinner className="size-4" />
				<span className="text-muted-foreground text-sm">Loading...</span>
			</div>
		)
	}

	if (!identities) {
		return null
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="mb-2 font-semibold text-lg">Connected Accounts</h3>
				<p className="mb-4 text-muted-foreground text-sm">
					Link your accounts to sign in with multiple methods
				</p>
			</div>

			<div className="space-y-3">
				{/* Email/Password */}
				<div className="flex items-center justify-between rounded-lg border p-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
							<span className="text-lg">📧</span>
						</div>
						<div>
							<p className="font-medium">Email & Password</p>
							<p className="text-muted-foreground text-sm">
								{identities.hasEmailPassword ? "Connected" : "Not connected"}
							</p>
						</div>
					</div>
					{identities.hasEmailPassword ? (
						<span className="text-muted-foreground text-sm">✓</span>
					) : (
						<Button disabled size="sm" variant="outline">
							Not Available
						</Button>
					)}
				</div>

				{/* Google */}
				<div className="flex items-center justify-between rounded-lg border p-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
							<svg
								className="size-5"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
						</div>
						<div>
							<p className="font-medium">Google</p>
							<p className="text-muted-foreground text-sm">
								{identities.hasGoogle ? "Connected" : "Not connected"}
							</p>
						</div>
					</div>
					{identities.hasGoogle ? (
						<span className="text-muted-foreground text-sm">✓</span>
					) : (
						<Button
							disabled={isLinking}
							onClick={handleLinkGoogle}
							size="sm"
							variant="outline"
						>
							{isLinking ? (
								<>
									<Spinner className="mr-2 size-4" />
									Linking...
								</>
							) : (
								"Link Account"
							)}
						</Button>
					)}
				</div>
			</div>

			<div className="rounded-lg bg-muted/50 p-3">
				<p className="text-muted-foreground text-xs">
					💡 Tip: Linking accounts allows you to sign in with either method
					using the same email address.
				</p>
			</div>
		</div>
	)
}

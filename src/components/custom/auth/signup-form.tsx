"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export function SignupForm() {
	const router = useRouter()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [displayName, setDisplayName] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		try {
			const supabase = createBrowserSupabaseClient()
			const { data, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						display_name: displayName || undefined,
					},
				},
			})

			if (signUpError) {
				setError(signUpError.message)
				return
			}

			if (data.user) {
				// Profile will be created automatically by database trigger
				// Trigger reads display_name from raw_user_meta_data
				// No need to call createProfile mutation
				router.push("/kurio")
				router.refresh()
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred",
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
			<div className="flex flex-col gap-2">
				<Label htmlFor="displayName">Display Name</Label>
				<Input
					disabled={isLoading}
					id="displayName"
					onChange={(e) => setDisplayName(e.target.value)}
					type="text"
					value={displayName}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Label htmlFor="email">Email</Label>
				<Input
					disabled={isLoading}
					id="email"
					onChange={(e) => setEmail(e.target.value)}
					required
					type="email"
					value={email}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Label htmlFor="password">Password</Label>
				<Input
					disabled={isLoading}
					id="password"
					onChange={(e) => setPassword(e.target.value)}
					required
					type="password"
					value={password}
				/>
			</div>
			{error && <p className="text-destructive text-sm">{error}</p>}
			<Button disabled={isLoading} type="submit">
				{isLoading ? "Signing up..." : "Sign Up"}
			</Button>
		</form>
	)
}

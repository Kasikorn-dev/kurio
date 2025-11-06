"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/trpc/react"

export function SignupForm() {
	const router = useRouter()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [displayName, setDisplayName] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const createProfile = api.auth.createProfile.useMutation()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		try {
			const supabase = createClient()
			const { data, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
			})

			if (signUpError) {
				setError(signUpError.message)
				return
			}

			if (data.user) {
				// Create user profile
				await createProfile.mutateAsync({
					displayName: displayName || undefined,
				})

				router.push("/kurios")
				router.refresh()
			}
		} catch (err) {
			setError("An unexpected error occurred")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Label htmlFor="displayName">Display Name</Label>
				<Input
					id="displayName"
					type="text"
					value={displayName}
					onChange={(e) => setDisplayName(e.target.value)}
					disabled={isLoading}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					disabled={isLoading}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					disabled={isLoading}
				/>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			<Button type="submit" disabled={isLoading}>
				{isLoading ? "Signing up..." : "Sign Up"}
			</Button>
		</form>
	)
}


"use client"

import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
	const router = useRouter()
	const { data: profile, isLoading } = api.auth.getProfile.useQuery()

	const handleLogout = async () => {
		const supabase = createClient()
		await supabase.auth.signOut()
		router.push("/login")
		router.refresh()
	}

	if (isLoading) {
		return <div>Loading...</div>
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 text-3xl font-bold">Profile</h1>
			<div className="space-y-4">
				<div>
					<p className="text-sm text-muted-foreground">Display Name</p>
					<p className="text-lg">{profile?.displayName || "Not set"}</p>
				</div>
				<Button onClick={handleLogout} variant="destructive">
					Logout
				</Button>
			</div>
		</div>
	)
}


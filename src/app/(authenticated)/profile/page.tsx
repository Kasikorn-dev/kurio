"use client"

import Link from "next/link"
import { ProfileSkeleton } from "@/components/custom/profile/profile-skeleton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export default function ProfilePage() {
	const { profile, isLoading, logout } = useAuth()

	if (isLoading) {
		return <ProfileSkeleton />
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-3xl">Profile</h1>
				<Link href="/profile/edit">
					<Button variant="outline">Edit Profile</Button>
				</Link>
			</div>
			<div className="space-y-4">
				<div>
					<p className="text-muted-foreground text-sm">Display Name</p>
					<p className="text-lg">{profile?.displayName || "Not set"}</p>
				</div>
				<Button onClick={logout} variant="destructive">
					Logout
				</Button>
			</div>
		</div>
	)
}

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
		<div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
			<div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="font-bold text-2xl sm:text-3xl">Profile</h1>
				<Link href="/profile/edit">
					<Button variant="outline" size="sm" className="w-full sm:w-auto sm:size-default">
						Edit Profile
					</Button>
				</Link>
			</div>
			<div className="space-y-4">
				<div>
					<p className="text-muted-foreground text-sm">Display Name</p>
					<p className="text-base sm:text-lg">{profile?.displayName || "Not set"}</p>
				</div>
				<Button onClick={logout} variant="destructive" size="sm" className="w-full sm:w-auto sm:size-default">
					Logout
				</Button>
			</div>
		</div>
	)
}

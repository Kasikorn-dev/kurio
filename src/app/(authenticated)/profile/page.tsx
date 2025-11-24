import type { Metadata } from "next"
import Link from "next/link"
import { LogoutButton } from "@/components/custom/profile/logout-button"
import { ProfileSkeleton } from "@/components/custom/profile/profile-skeleton"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/server"

export const metadata: Metadata = {
	title: "Profile",
	description: "Manage your profile and account settings",
}

export default async function ProfilePage() {
	const profile = await api.auth.getProfile()

	if (!profile) {
		return <ProfileSkeleton />
	}

	return (
		<div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
			<div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="font-bold text-2xl sm:text-3xl">Profile</h1>
				<Link href="/profile/edit">
					<Button
						className="w-full sm:size-default sm:w-auto"
						size="sm"
						variant="outline"
					>
						Edit Profile
					</Button>
				</Link>
			</div>
			<div className="space-y-4">
				<div>
					<p className="text-muted-foreground text-sm">Display Name</p>
					<p className="text-base sm:text-lg">
						{profile.displayName || "Not set"}
					</p>
				</div>
				<LogoutButton className="w-full sm:size-default sm:w-auto" />
			</div>
		</div>
	)
}

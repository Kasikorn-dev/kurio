"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AccountLinking } from "@/components/custom/profile/account-linking"
import { ProfileSkeleton } from "@/components/custom/profile/profile-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/trpc/react"

export default function EditProfilePage() {
	const router = useRouter()
	const { profile, isLoading } = useAuth()
	const updateProfile = api.auth.updateProfile.useMutation({
		onSuccess: () => {
			toast.success("Profile updated successfully")
			router.push("/profile")
			router.refresh()
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update profile")
		},
	})

	const [displayName, setDisplayName] = useState("")

	// Sync displayName with profile data when it loads
	useEffect(() => {
		if (profile) {
			setDisplayName(profile.displayName ?? "")
		}
	}, [profile])

	if (isLoading) {
		return <ProfileSkeleton />
	}

	if (!profile) {
		return <div>Profile not found</div>
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await updateProfile.mutateAsync({
			displayName: displayName || undefined,
		})
	}

	return (
		<div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
			<h1 className="mb-4 font-bold text-2xl sm:mb-6 sm:text-3xl">
				Edit Profile
			</h1>

			<div className="flex max-w-2xl flex-col gap-6 sm:gap-8">
				{/* Profile Information */}
				<div>
					<h2 className="mb-4 font-semibold text-lg sm:text-xl">
						Profile Information
					</h2>
					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-2">
							<Label htmlFor="displayName">Display Name</Label>
							<Input
								disabled={updateProfile.isPending}
								id="displayName"
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="Enter display name"
								value={displayName}
							/>
						</div>
						<div className="flex flex-col gap-2 sm:flex-row">
							<Button
								className="w-full sm:size-default sm:w-auto"
								disabled={updateProfile.isPending}
								size="sm"
								type="submit"
							>
								{updateProfile.isPending && <Spinner className="mr-2 size-4" />}
								{updateProfile.isPending ? "Saving..." : "Save Changes"}
							</Button>
							<Button
								className="w-full sm:size-default sm:w-auto"
								disabled={updateProfile.isPending}
								onClick={() => router.back()}
								size="sm"
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
						</div>
					</form>
				</div>

				<Separator />

				{/* Account Linking */}
				<div>
					<AccountLinking />
				</div>
			</div>
		</div>
	)
}

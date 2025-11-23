"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import type { userProfiles } from "@/server/db/schemas/user-profiles"
import { api } from "@/trpc/react"

type UseAuthReturn = {
	profile: typeof userProfiles.$inferSelect | null | undefined
	isLoading: boolean
	updateProfile: ReturnType<typeof api.auth.updateProfile.useMutation>
	logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
	const router = useRouter()
	const supabase = createBrowserSupabaseClient()
	const { data: profile, isLoading } = api.auth.getProfile.useQuery()
	const updateProfile = api.auth.updateProfile.useMutation()

	const logout = useCallback(async (): Promise<void> => {
		try {
			await supabase.auth.signOut()
			router.push("/")
			router.refresh()
		} catch (_error) {
			// Silently handle logout errors - user will be redirected anyway
			// In production, log to error tracking service
			router.push("/")
			router.refresh()
		}
	}, [router, supabase])

	return {
		profile,
		isLoading,
		updateProfile,
		logout,
	}
}

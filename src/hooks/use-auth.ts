"use client"

import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { api } from "@/trpc/react"

export function useAuth() {
	const router = useRouter()
	const supabase = createBrowserSupabaseClient()
	const { data: profile, isLoading } = api.auth.getProfile.useQuery()
	const updateProfile = api.auth.updateProfile.useMutation()

	const logout = async () => {
		await supabase.auth.signOut()
		router.push("/login")
		router.refresh()
	}

	return {
		profile,
		isLoading,
		updateProfile,
		logout,
	}
}

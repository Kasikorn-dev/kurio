"use client"

import { createClient } from "@/lib/supabase/client"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"

export function useAuth() {
	const router = useRouter()
	const supabase = createClient()
	const { data: profile } = api.auth.getProfile.useQuery()
	const updateProfile = api.auth.updateProfile.useMutation()

	const logout = async () => {
		await supabase.auth.signOut()
		router.push("/login")
		router.refresh()
	}

	return {
		profile,
		updateProfile,
		logout,
	}
}


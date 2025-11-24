"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

type LogoutButtonProps = {
	className?: string
	size?: "sm" | "md" | "lg" | "icon" | "default"
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link"
}

export function LogoutButton({
	className,
	size = "sm",
	variant = "destructive",
}: LogoutButtonProps) {
	const router = useRouter()
	const supabase = createBrowserSupabaseClient()

	const handleLogout = useCallback(async (): Promise<void> => {
		try {
			await supabase.auth.signOut()
			router.push("/")
			router.refresh()
		} catch (_error) {
			// Silently handle logout errors - user will be redirected anyway
			router.push("/")
			router.refresh()
		}
	}, [router, supabase])

	return (
		<Button
			className={className}
			onClick={handleLogout}
			size={size}
			variant={variant}
		>
			Logout
		</Button>
	)
}

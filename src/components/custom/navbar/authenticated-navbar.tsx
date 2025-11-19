"use client"

import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useNavigation } from "@/hooks/use-navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { UserMenu } from "./user-menu"

type AuthenticatedNavbarProps = {
	initialUser: User
}

export function AuthenticatedNavbar({ initialUser }: AuthenticatedNavbarProps) {
	const { navigate } = useNavigation()
	const [user, setUser] = useState<User>(initialUser)
	const supabase = createBrowserSupabaseClient()

	// Listen for auth state changes for real-time updates (e.g., logout from another tab)
	useEffect(() => {
		setUser(initialUser)

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				setUser(session.user)
			} else {
				// User logged out, redirect to home
				navigate("/", true)
			}
		})

		return () => subscription.unsubscribe()
	}, [initialUser, supabase, navigate])

	return (
		<nav className="border-b">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<Link className="font-bold text-xl" href="/kurio">
					Kurio
				</Link>
				<div className="flex items-center gap-4">
					<Link href="/kurio">
						<Button variant="ghost">My Kurios</Button>
					</Link>
					<UserMenu user={user} />
				</div>
			</div>
		</nav>
	)
}

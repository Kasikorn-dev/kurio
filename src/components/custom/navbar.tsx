"use client"

import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/custom/theme-toggle"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

type NavbarProps = {
	initialUser?: User | null
}

export function Navbar({ initialUser = null }: NavbarProps) {
	const router = useRouter()
	const [user, setUser] = useState<User | null>(initialUser ?? null)
	const supabase = createBrowserSupabaseClient()

	// Listen for auth state changes for real-time updates (e.g., logout from another tab)
	useEffect(() => {
		setUser(initialUser ?? null)

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null)
		})

		return () => subscription.unsubscribe()
	}, [initialUser, supabase])

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut()
			setUser(null)
			router.push("/")
			router.refresh()
		} catch (error) {
			console.error("Error logging out:", error)
		}
	}

	return (
		<nav className="border-b">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<Link className="font-bold text-xl" href="/">
					Kurio
				</Link>
				<div className="flex items-center gap-4">
					<ThemeToggle />
					{user ? (
						<>
							<Link href="/kurio">
								<Button variant="ghost">My Kurios</Button>
							</Link>
							<Link href="/profile">
								<Button variant="ghost">Profile</Button>
							</Link>
							<Button onClick={handleLogout} variant="outline">
								Sign Out
							</Button>
						</>
					) : (
						<>
							<Link href="/login">
								<Button variant="ghost">Sign In</Button>
							</Link>
							<Link href="/signup">
								<Button>Sign Up</Button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}

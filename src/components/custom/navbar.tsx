"use client"

import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/custom/theme-toggle"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

type NavbarProps = {
	initialUser?: User | null
}

export function Navbar({ initialUser = null }: NavbarProps) {
	const router = useRouter()
	const [user, setUser] = useState<User | null>(initialUser ?? null)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

	const handleLogout = async (): Promise<void> => {
		try {
			await supabase.auth.signOut()
			setUser(null)
			router.push("/")
			router.refresh()
		} catch (error) {
			// Silently handle logout errors - user will be redirected anyway
			if (error instanceof Error) {
				// Log to error tracking service in production
				// For now, we'll just redirect
			}
		}
	}

	return (
		<nav className="border-b">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				{/* Logo */}
				<Link className="font-bold text-xl" href="/">
					Kurio
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden items-center gap-2 md:flex md:gap-4">
					<ThemeToggle />
					{user ? (
						<>
							<Link href="/kurio">
								<Button variant="ghost" size="sm" className="md:size-default">
									My Kurios
								</Button>
							</Link>
							<Link href="/profile">
								<Button variant="ghost" size="sm" className="md:size-default">
									Profile
								</Button>
							</Link>
							<Button onClick={handleLogout} variant="outline" size="sm" className="md:size-default">
								Sign Out
							</Button>
						</>
					) : (
						<>
							<Link href="/login">
								<Button variant="ghost" size="sm" className="md:size-default">
									Sign In
								</Button>
							</Link>
							<Link href="/signup">
								<Button size="sm" className="md:size-default">
									Sign Up
								</Button>
							</Link>
						</>
					)}
				</div>

				{/* Mobile Menu Button */}
				<div className="flex items-center gap-2 md:hidden">
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					</Button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="border-t md:hidden">
					<div className="container mx-auto flex flex-col gap-2 px-4 py-4">
						{user ? (
							<>
								<Link href="/kurio" onClick={() => setMobileMenuOpen(false)}>
									<Button variant="ghost" className="w-full justify-start">
										My Kurios
									</Button>
								</Link>
								<Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
									<Button variant="ghost" className="w-full justify-start">
										Profile
									</Button>
								</Link>
								<Button
									onClick={() => {
										setMobileMenuOpen(false)
										handleLogout()
									}}
									variant="outline"
									className="w-full justify-start"
								>
									Sign Out
								</Button>
							</>
						) : (
							<>
								<Link href="/login" onClick={() => setMobileMenuOpen(false)}>
									<Button variant="ghost" className="w-full justify-start">
										Sign In
									</Button>
								</Link>
								<Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
									<Button className="w-full justify-start">
										Sign Up
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	)
}

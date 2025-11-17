"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/custom/theme-toggle"
import { Button } from "@/components/ui/button"

export function PublicNavbar() {
	return (
		<nav className="border-b mb-16">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<Link className="font-bold text-xl" href="/">
					Kurio
				</Link>
				<div className="flex items-center gap-4">
					<ThemeToggle />
					<Link href="/login">
						<Button variant="ghost">Sign In</Button>
					</Link>
					<Link href="/signup">
						<Button>Sign Up</Button>
					</Link>
				</div>
			</div>
		</nav>
	)
}

"use client"

import type { User } from "@supabase/supabase-js"
import {
	HelpCircle,
	LogOut,
	Monitor,
	Moon,
	Settings,
	Sun,
	User as UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/trpc/react"

type UserMenuProps = {
	user: User
}

export function UserMenu({ user }: UserMenuProps) {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const { logout } = useAuth()
	const { data: profile } = api.auth.getProfile.useQuery()

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true)
	}, [])

	// Get user display name
	const displayName =
		profile?.displayName || user.email?.split("@")[0] || "User"
	const email = user.email || ""

	// Get initials for avatar
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2)

	if (!mounted) {
		return (
			<Button className="size-9 rounded-full" size="icon" variant="ghost">
				<UserIcon className="size-4" />
			</Button>
		)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="size-9 rounded-full" size="icon" variant="ghost">
					<Avatar className="size-9">
						<AvatarFallback className="bg-primary text-primary-foreground">
							{initials}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm leading-none">{displayName}</p>
						<p className="text-muted-foreground text-xs leading-none">
							{email.length > 30 ? `${email.slice(0, 30)}...` : email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{/* <DropdownMenuLabel className="text-xs">Theme</DropdownMenuLabel> */}
					<DropdownMenuRadioGroup onValueChange={setTheme} value={theme}>
						<DropdownMenuRadioItem value="light">
							<Sun className="mr-2 size-4" />
							<span>Light</span>
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="dark">
							<Moon className="mr-2 size-4" />
							<span>Dark</span>
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="system">
							<Monitor className="mr-2 size-4" />
							<span>System</span>
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/profile">
							<UserIcon className="mr-2 size-4" />
							<span>Your profile</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/terms">
							<Settings className="mr-2 size-4" />
							<span>Terms & policies</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/help">
							<HelpCircle className="mr-2 size-4" />
							<span>Help</span>
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={logout} variant="destructive">
					<LogOut className="mr-2 size-4" />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

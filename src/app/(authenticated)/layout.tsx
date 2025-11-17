import { redirect } from "next/navigation"
import { AuthenticatedNavbar } from "@/components/custom/navbar/authenticated-navbar"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const supabase = await createServerSupabaseClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect("/login")
	}

	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<AuthenticatedNavbar initialUser={user} />
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	)
}

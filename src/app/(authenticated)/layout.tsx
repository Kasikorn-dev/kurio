import { redirect } from "next/navigation"
import { Navbar } from "@/components/custom/navbar"
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
		<div className="flex min-h-screen flex-col">
			<Navbar initialUser={user} />
			<main className="flex-1">{children}</main>
		</div>
	)
}

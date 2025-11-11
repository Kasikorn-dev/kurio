import { Navbar } from "@/components/custom/navbar"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function PublicLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const supabase = await createServerSupabaseClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar initialUser={user} />
			<main className="flex flex-1 items-center justify-center">
				{children}
			</main>
		</div>
	)
}

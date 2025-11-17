import { Footer } from "@/components/custom/footer"
import { AuthenticatedNavbar } from "@/components/custom/navbar/authenticated-navbar"
import { PublicNavbar } from "@/components/custom/navbar/public-navbar"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function OtherLayout({
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
			{user ? <AuthenticatedNavbar initialUser={user} /> : <PublicNavbar />}
			<main className="flex flex-1 items-center justify-center py-12">
				{children}
			</main>
			<Footer />
		</div>
	)
}

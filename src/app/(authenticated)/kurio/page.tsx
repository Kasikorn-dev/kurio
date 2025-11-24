import type { Metadata } from "next"
import Link from "next/link"
import { KurioList } from "@/components/custom/kurio/kurio-list"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/server"

export const metadata: Metadata = {
	title: "My Kurios",
	description: "View and manage your learning journeys",
}

export default async function KuriosPage() {
	const kurios = await api.kurio.getAll()
	const hasKurios = kurios && kurios.length > 0

	return (
		<div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
			<div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="font-bold text-2xl sm:text-3xl">My Kurios</h1>
				{hasKurios && (
					<Link href="/create-kurio">
						<Button className="w-full sm:size-default sm:w-auto" size="sm">
							Create New Kurio
						</Button>
					</Link>
				)}
			</div>
			<KurioList kurios={kurios} />
		</div>
	)
}

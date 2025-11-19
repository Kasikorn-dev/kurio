import Link from "next/link"
import { KurioListClient } from "@/components/custom/kurio/kurio-list-client"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/server"

export default async function KuriosPage() {
	const kurios = await api.kurio.getAll()
	const hasKurios = kurios && kurios.length > 0

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-3xl">My Kurios</h1>
				{hasKurios && (
					<Link href="/create-kurio">
						<Button>Create New Kurio</Button>
					</Link>
				)}
			</div>
			<KurioListClient kurios={kurios} />
		</div>
	)
}

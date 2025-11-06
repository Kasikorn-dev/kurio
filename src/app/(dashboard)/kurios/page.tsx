import { KurioList } from "@/components/custom/kurio/kurio-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function KuriosPage() {
	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold">My Kurios</h1>
				<Link href="/kurios/create">
					<Button>Create New Kurio</Button>
				</Link>
			</div>
			<KurioList />
		</div>
	)
}


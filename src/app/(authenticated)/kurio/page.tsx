import Link from "next/link"
import { KurioList } from "@/components/custom/kurio/kurio-list"
import { Button } from "@/components/ui/button"

export default function KuriosPage() {
	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-3xl">My Kurios</h1>
				<Link href="/create-kurio">
					<Button>Create New Kurio</Button>
				</Link>
			</div>
			<KurioList />
		</div>
	)
}

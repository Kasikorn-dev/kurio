"use client"

import { api } from "@/trpc/react"
import { KurioCard } from "./kurio-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function KurioList() {
	const { data: kurios, isLoading } = api.kurio.getAll.useQuery()

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!kurios || kurios.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12">
				<p className="text-muted-foreground">No kurios yet</p>
				<Link href="/kurios/create">
					<Button>Create your first Kurio</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{kurios.map((kurio) => (
				<KurioCard key={kurio.id} kurio={kurio} />
			))}
		</div>
	)
}


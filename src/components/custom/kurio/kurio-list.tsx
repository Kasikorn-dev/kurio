"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useKurio } from "@/hooks/use-kurio"
import { KurioCard } from "./kurio-card"
import { KurioCardSkeleton } from "./kurio-card-skeleton"

export function KurioList() {
	const { kurios, isLoading } = useKurio()

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<KurioCardSkeleton key={i} />
				))}
			</div>
		)
	}

	if (!kurios || kurios?.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12">
				<p className="text-muted-foreground">No kurios yet</p>
				<Link href="/create-kurio">
					<Button>Create your first Kurio</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{kurios?.map((kurio) => (
				<KurioCard key={kurio.id} kurio={kurio} />
			))}
		</div>
	)
}

/**
 * Server component for displaying list of Kurios
 * No client-side features needed - can be server component
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UI_CONSTANTS } from "@/lib/constants"
import { KurioCard } from "./kurio-card"
import { KurioCardSkeleton } from "./kurio-card-skeleton"
import type { KurioForList } from "./types"

type KurioListProps = {
	kurios: KurioForList[]
	isLoading?: boolean
}

export function KurioList({ kurios, isLoading }: KurioListProps) {
	if (isLoading) {
		const skeletonKeys = Array.from(
			{ length: UI_CONSTANTS.SKELETON_COUNT.KURIO_CARD },
			(_, i) => `kurio-skeleton-${i}`,
		)

		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{skeletonKeys.map((key) => (
					<KurioCardSkeleton key={key} />
				))}
			</div>
		)
	}

	if (!kurios || kurios.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12">
				<p className="text-center text-muted-foreground text-sm sm:text-base">
					No kurios yet
				</p>
				<Link href="/create-kurio">
					<Button className="sm:size-default" size="sm">
						Create your first Kurio
					</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{kurios.map((kurio) => (
				<KurioCard key={kurio.id} kurio={kurio} />
			))}
		</div>
	)
}

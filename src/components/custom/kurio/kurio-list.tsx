/**
 * Server component for displaying list of Kurios
 * Empty state uses client component wrapper for animations
 */

import { UI_CONSTANTS } from "@/lib/constants"
import { KurioCard } from "./kurio-card"
import { KurioCardSkeleton } from "./kurio-card-skeleton"
import { KurioListEmptyState } from "./kurio-list-empty-state"
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
		return <KurioListEmptyState />
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{kurios.map((kurio) => (
				<KurioCard key={kurio.id} kurio={kurio} />
			))}
		</div>
	)
}

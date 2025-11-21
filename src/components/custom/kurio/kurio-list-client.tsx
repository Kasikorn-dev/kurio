import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UI_CONSTANTS } from "@/lib/constants"
import { KurioCard } from "./kurio-card"
import { KurioCardSkeleton } from "./kurio-card-skeleton"

type KurioListClientProps = {
	kurios: Array<{
		id: string
		title: string
		description: string | null
		status: string
		createdAt: Date
		resources: Array<unknown>
	}>
	isLoading?: boolean
}

export function KurioListClient({ kurios, isLoading }: KurioListClientProps) {
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
					<Button size="sm" className="sm:size-default">
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

/**
 * Server component for unit skeleton
 * No client-side features needed
 */

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type UnitSkeletonProps = {
	position?: "center" | "left" | "right"
	unitNumber: number
}

export function UnitSkeleton({ position = "center" }: UnitSkeletonProps) {
	return (
		<div
			className={cn(
				"flex w-full items-center gap-4",
				position === "center" && "justify-center",
				position === "right" && "justify-end pr-12",
				position === "left" && "justify-start pl-12",
			)}
		>
			<div className="flex flex-col items-center gap-4">
				{/* Circle skeleton */}
				<div className="relative">
					<Skeleton className="size-24 rounded-full" />
					{/* Unit number badge skeleton */}
					<Skeleton className="-right-2 -top-2 absolute size-8 rounded-full" />
				</div>

				{/* Unit info skeleton */}
				<div className="max-w-[220px] space-y-2 text-center">
					<Skeleton className="mx-auto h-5 w-32" />
					<Skeleton className="mx-auto h-4 w-20" />
				</div>
			</div>
		</div>
	)
}

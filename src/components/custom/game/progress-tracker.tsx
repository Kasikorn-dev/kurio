"use client"

import { Progress } from "@/components/ui/progress"
import { useUnitProgress } from "@/hooks/use-unit-progress"

type ProgressTrackerProps = {
	kurioId: string
}

export function ProgressTracker({ kurioId }: ProgressTrackerProps) {
	const { totalUnits, completedUnits, progressPercentage } =
		useUnitProgress(kurioId)

	if (totalUnits === 0) {
		return null
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<span className="font-medium text-sm">Progress</span>
				<span className="text-muted-foreground text-sm">
					{completedUnits} / {totalUnits} units
				</span>
			</div>
			<Progress value={progressPercentage} />
		</div>
	)
}

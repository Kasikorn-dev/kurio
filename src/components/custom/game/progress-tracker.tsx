"use client"

import { api } from "@/trpc/react"
import { Progress } from "@/components/ui/progress"

type ProgressTrackerProps = {
	kurioId: string
}

export function ProgressTracker({ kurioId }: ProgressTrackerProps) {
	const { data: kurio } = api.kurio.getById.useQuery({ id: kurioId })

	if (!kurio) {
		return null
	}

	// Calculate progress from all lessons
	const totalLessons = kurio.units.reduce(
		(acc, unit) => acc + unit.lessons.length,
		0,
	)
	const completedLessons = 0 // TODO: Calculate from player_lesson_progress

	const progressPercentage =
		totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Progress</span>
				<span className="text-sm text-muted-foreground">
					{completedLessons} / {totalLessons} lessons
				</span>
			</div>
			<Progress value={progressPercentage} />
		</div>
	)
}


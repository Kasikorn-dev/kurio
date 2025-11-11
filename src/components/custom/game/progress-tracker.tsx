"use client"

import { Progress } from "@/components/ui/progress"
import { useLessonProgress } from "@/hooks/use-lesson-progress"

type ProgressTrackerProps = {
	kurioId: string
}

export function ProgressTracker({ kurioId }: ProgressTrackerProps) {
	const { totalLessons, completedLessons, progressPercentage } =
		useLessonProgress(kurioId)

	if (totalLessons === 0) {
		return null
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<span className="font-medium text-sm">Progress</span>
				<span className="text-muted-foreground text-sm">
					{completedLessons} / {totalLessons} lessons
				</span>
			</div>
			<Progress value={progressPercentage} />
		</div>
	)
}

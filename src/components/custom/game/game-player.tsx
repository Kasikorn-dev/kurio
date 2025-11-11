"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useExerciseNavigation } from "@/hooks/use-exercise-navigation"
import { api } from "@/trpc/react"
import { ExerciseRenderer } from "./exercise-renderer"
import { GamePlayerSkeleton } from "./game-player-skeleton"
import { ProgressTracker } from "./progress-tracker"

type GamePlayerProps = {
	kurioId: string
}

export function GamePlayer({ kurioId }: GamePlayerProps) {
	const { data: kurio, isLoading } = api.kurio.getById.useQuery({ id: kurioId })
	const firstExercise = kurio?.units[0]?.lessons[0]?.exercises[0]
	const [currentExerciseId, setCurrentExerciseId] = useState(
		firstExercise?.id ?? "",
	)

	const { nextExercise, previousExercise, currentIndex, totalExercises } =
		useExerciseNavigation(kurioId, currentExerciseId)

	if (isLoading || !kurio) {
		return <GamePlayerSkeleton />
	}

	if (!firstExercise) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">
					<p className="text-muted-foreground">No exercises available</p>
					<p className="mt-2 text-muted-foreground text-sm">
						Generate game content first
					</p>
				</div>
			</div>
		)
	}

	const currentExercise =
		kurio.units
			.flatMap((unit) => unit.lessons)
			.flatMap((lesson) => lesson.exercises)
			.find((ex) => ex.id === currentExerciseId) ?? firstExercise

	const handleNext = () => {
		if (nextExercise) {
			setCurrentExerciseId(nextExercise.id)
		}
	}

	const handlePrevious = () => {
		if (previousExercise) {
			setCurrentExerciseId(previousExercise.id)
		}
	}

	const handleComplete = () => {
		if (nextExercise) {
			setTimeout(() => {
				setCurrentExerciseId(nextExercise.id)
			}, 2000)
		}
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 font-bold text-3xl">{kurio.title}</h1>
			<ProgressTracker kurioId={kurioId} />
			<div className="mb-4 flex items-center justify-between">
				<span className="text-muted-foreground text-sm">
					Exercise {currentIndex + 1} of {totalExercises}
				</span>
				<div className="flex gap-2">
					<Button
						disabled={!previousExercise}
						onClick={handlePrevious}
						variant="outline"
					>
						Previous
					</Button>
					<Button
						disabled={!nextExercise}
						onClick={handleNext}
						variant="outline"
					>
						Next
					</Button>
				</div>
			</div>
			<div className="mt-8">
				<ExerciseRenderer
					exercise={currentExercise}
					onComplete={handleComplete}
				/>
			</div>
		</div>
	)
}

"use client"

import { Check, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"

type KurioPathViewerProps = {
	kurio: {
		id: string
		title: string
		description: string | null
		status: string
		units: Array<{
			id: string
			title: string
			orderIndex: number
			games: Array<{
				id: string
				title: string
				orderIndex: number
			}>
		}>
	}
}

export function KurioPathViewer({ kurio }: KurioPathViewerProps) {
	const { data: allProgress } = api.game.getAllUnitProgress.useQuery(
		{
			unitIds: kurio.units.map((unit) => unit.id),
		},
		{ enabled: kurio.units.length > 0 },
	)

	// Create a map of unit progress
	const unitProgressMap = new Map(
		allProgress?.map((progress) => [progress.unitId, progress]) ?? [],
	)

	// Flatten all games with their unit info
	const allGames: Array<{
		gameId: string
		gameTitle: string
		unitId: string
		unitTitle: string
		unitIndex: number
		gameIndex: number
		isCompleted: boolean
		isLocked: boolean
	}> = []

	kurio.units.forEach((unit, unitIndex) => {
		const unitProgress = unitProgressMap.get(unit.id)
		const isUnitCompleted = unitProgress?.isCompleted ?? false

		unit.games.forEach((game, gameIndex) => {
			// Game is completed if unit is completed
			// Game is locked if previous unit exists and is not completed
			const previousUnit = unitIndex > 0 ? kurio.units[unitIndex - 1] : null
			const previousUnitProgress = previousUnit
				? unitProgressMap.get(previousUnit.id)
				: null
			const isLocked =
				previousUnit !== null &&
				(previousUnitProgress?.isCompleted ?? false) === false

			allGames.push({
				gameId: game.id,
				gameTitle: game.title,
				unitId: unit.id,
				unitTitle: unit.title,
				unitIndex,
				gameIndex,
				isCompleted: isUnitCompleted,
				isLocked,
			})
		})
	})

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8 text-center">
				<h1 className="font-bold text-3xl">{kurio.title}</h1>
				{kurio.description && (
					<p className="mt-2 text-muted-foreground">{kurio.description}</p>
				)}
			</div>

			{/* Path visualization */}
			<div className="relative flex flex-col items-center gap-8">
				{allGames.map((game, index) => {
					const isFirst = index === 0
					const isLast = index === allGames.length - 1
					const isNewUnit =
						index > 0 && game.unitIndex !== allGames[index - 1]?.unitIndex

					return (
						<div className="flex flex-col items-center" key={game.gameId}>
							{/* Unit title separator */}
							{isNewUnit && (
								<div className="mb-4 w-full border-t pt-4 text-center">
									<h3 className="font-semibold text-lg">{game.unitTitle}</h3>
								</div>
							)}

							{/* Path line */}
							{!isFirst && (
								<div
									className={cn(
										"h-12 w-0.5",
										game.isCompleted || !game.isLocked
											? "bg-primary"
											: "bg-muted",
									)}
								/>
							)}

							{/* Game node */}
							<button
								className={cn(
									"relative flex size-16 items-center justify-center rounded-full border-2 transition-all",
									game.isCompleted
										? "border-green-500 bg-green-500/20 text-green-600"
										: game.isLocked
											? "cursor-not-allowed border-muted bg-muted/20 text-muted-foreground"
											: "cursor-pointer border-primary bg-primary/20 text-primary hover:scale-110",
								)}
								disabled={game.isLocked}
								type="button"
							>
								{game.isCompleted ? (
									<Check className="size-8" />
								) : game.isLocked ? (
									<Lock className="size-8" />
								) : (
									<span className="font-bold text-lg">{index + 1}</span>
								)}
							</button>

							{/* Game title */}
							<div className="mt-2 max-w-32 text-center">
								<p
									className={cn(
										"text-sm",
										game.isLocked && "text-muted-foreground",
									)}
								>
									{game.gameTitle}
								</p>
							</div>

							{/* Path line to next */}
							{!isLast && (
								<div
									className={cn(
										"h-12 w-0.5",
										game.isCompleted ? "bg-primary" : "bg-muted",
									)}
								/>
							)}
						</div>
					)
				})}
			</div>

			{/* Progress summary */}
			<div className="mt-12 text-center">
				<p className="text-muted-foreground text-sm">
					{allGames.filter((g) => g.isCompleted).length} / {allGames.length}{" "}
					games completed
				</p>
			</div>
		</div>
	)
}

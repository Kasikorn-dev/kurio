"use client"

import { Check, Lock, Play } from "lucide-react"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import {
	calculateProgressPercentage,
	calculateUnitPosition,
	isUnitLocked,
} from "./helpers"
import type { KurioForPathViewer } from "./types"
import { UnitSkeleton } from "./unit-skeleton"

type KurioPathViewerProps = {
	kurio: KurioForPathViewer
	onUnitClick: (unitId: string) => void
}

export function KurioPathViewer({ kurio, onUnitClick }: KurioPathViewerProps) {
	const unitIds = useMemo(
		() => kurio.units.map((unit) => unit.id),
		[kurio.units],
	)

	const { data: allProgress } = api.game.getAllUnitProgress.useQuery(
		{ unitIds },
		{ enabled: kurio.units.length > 0 },
	)

	// Memoize unit progress map
	const unitProgressMap = useMemo(
		() =>
			new Map(
				allProgress?.map((progress) => [progress.unitId, progress]) ?? [],
			),
		[allProgress],
	)

	// Memoize overall progress calculation
	const { completedGames, progressPercentage } = useMemo(() => {
		const completed =
			allProgress?.reduce((sum, p) => sum + p.completedGames, 0) ?? 0
		const percentage = calculateProgressPercentage(completed, kurio.totalGames)
		return { completedGames: completed, progressPercentage: percentage }
	}, [allProgress, kurio.totalGames])

	return (
		<div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
			{/* Header - Left aligned */}
			<div className="mb-6 sm:mb-8">
				<h1 className="font-bold text-2xl sm:text-3xl">{kurio.title}</h1>
				{kurio.description && (
					<p className="mt-2 text-muted-foreground text-sm sm:text-base">
						{kurio.description}
					</p>
				)}

				{/* Progress bar */}
				<div className="mt-4 max-w-full sm:mt-6 sm:max-w-md">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Progress</span>
						<span className="font-medium">{progressPercentage}%</span>
					</div>
					<div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full bg-primary transition-all duration-500"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
					<p className="mt-2 text-muted-foreground text-xs">
						{completedGames} / {kurio.totalGames} games completed
					</p>
				</div>
			</div>

			{/* Winding Path */}
			<div className="relative mx-auto max-w-full px-2 py-4 sm:max-w-3xl sm:px-0 sm:py-8">
				<div className="flex flex-col items-center gap-6 sm:gap-8">
					{/* Render existing units */}
					{kurio.units.map((unit, index) => {
						const unitProgress = unitProgressMap.get(unit.id)
						const isCompleted = unitProgress?.isCompleted ?? false
						const completedGamesInUnit = unitProgress?.completedGames ?? 0
						const totalGamesInUnit = unit.games.length
						const isLocked = isUnitLocked(index, kurio.units, unitProgressMap)
						const position = calculateUnitPosition(index)

						return (
							<div
								className={cn(
									"flex w-full items-center gap-4",
									position === "center" && "justify-center",
									position === "right" && "justify-end pr-12",
									position === "left" && "justify-start pl-12",
								)}
								key={unit.id}
							>
								{/* Unit Node */}
								<button
									className={cn(
										"group relative flex flex-col items-center gap-4 transition-all duration-300",
										!isLocked &&
											"hover:-translate-y-1 cursor-pointer hover:scale-110",
										isLocked && "cursor-not-allowed",
									)}
									disabled={isLocked}
									onClick={() => !isLocked && onUnitClick(unit.id)}
								>
									{/* Circle */}
									<div
										className={cn(
											"relative flex size-24 items-center justify-center rounded-full border-4 transition-all duration-300",
											isCompleted &&
												"border-green-500 bg-green-500/20 shadow-green-500/30 shadow-xl",
											!isCompleted &&
												!isLocked &&
												"border-primary bg-primary/20 shadow-primary/30 shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/40",
											isLocked && "cursor-not-allowed border-muted bg-muted/10",
										)}
									>
										{isCompleted ? (
											<Check
												className="size-12 text-green-600"
												strokeWidth={3}
											/>
										) : isLocked ? (
											<Lock className="size-10 text-muted-foreground" />
										) : (
											<Play
												className="size-10 text-primary"
												fill="currentColor"
											/>
										)}

										{/* Unit number badge */}
										<div
											className={cn(
												"-right-2 -top-2 absolute flex size-8 items-center justify-center rounded-full border-2 border-background font-bold text-sm shadow-lg",
												isCompleted && "bg-green-500 text-white",
												!isCompleted &&
													!isLocked &&
													"bg-primary text-primary-foreground",
												isLocked && "bg-muted text-muted-foreground",
											)}
										>
											{index + 1}
										</div>
									</div>

									{/* Unit info */}
									<div className="max-w-[220px] text-center">
										<p
											className={cn(
												"font-semibold text-base leading-tight",
												isLocked && "text-muted-foreground",
											)}
										>
											{unit.title}
										</p>
										<p className="mt-2 text-muted-foreground text-sm">
											{completedGamesInUnit} / {totalGamesInUnit} games
										</p>
									</div>
								</button>
							</div>
						)
					})}

					{/* Render skeleton placeholders for units still being generated */}
					{kurio.unitCount !== null && kurio.units.length < kurio.unitCount && (
						<>
							{Array.from({ length: kurio.unitCount - kurio.units.length }).map(
								(_, skeletonIndex) => {
									const actualIndex = kurio.units.length + skeletonIndex
									const position = calculateUnitPosition(actualIndex)

									return (
										<UnitSkeleton
											key={`skeleton-${actualIndex}`}
											position={position}
											unitNumber={actualIndex + 1}
										/>
									)
								},
							)}
						</>
					)}
				</div>
			</div>

			{/* Empty state */}
			{kurio.units.length === 0 && kurio.unitCount === null && (
				<div className="mt-12 text-center text-muted-foreground">
					No units available yet
				</div>
			)}
		</div>
	)
}

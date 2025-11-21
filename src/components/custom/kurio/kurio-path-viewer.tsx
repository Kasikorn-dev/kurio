"use client"

import { Check, Lock, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"

type KurioPathViewerProps = {
	kurio: {
		id: string
		title: string
		description: string | null
		status: string
		totalGames: number
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
	onUnitClick: (unitId: string) => void
}

export function KurioPathViewer({ kurio, onUnitClick }: KurioPathViewerProps) {
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

	// Calculate overall progress
	const completedGames = allProgress?.reduce(
		(sum, p) => sum + p.completedGames,
		0,
	) ?? 0
	const progressPercentage = kurio.totalGames > 0
		? Math.round((completedGames / kurio.totalGames) * 100)
		: 0

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
				<div className="mt-4 sm:mt-6 max-w-full sm:max-w-md">
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
				{kurio.units.map((unit, index) => {
					const unitProgress = unitProgressMap.get(unit.id)
					const isCompleted = unitProgress?.isCompleted ?? false
					const completedGamesInUnit = unitProgress?.completedGames ?? 0
					const totalGamesInUnit = unit.games.length
					
					// Check if previous unit is completed (for locking)
					const previousUnit = index > 0 ? kurio.units[index - 1] : null
					const previousUnitProgress = previousUnit
						? unitProgressMap.get(previousUnit.id)
						: null
					const isLocked =
						previousUnit !== null &&
						(previousUnitProgress?.isCompleted ?? false) === false
					
					// Determine position (snake pattern: center-right-center-left)
					const position = 
						index % 4 === 0 ? "center" : 
						index % 4 === 1 ? "right" : 
						index % 4 === 2 ? "center" : 
						"left"

					return (
						<div
							key={unit.id}
							className={cn(
								"flex w-full items-center gap-4",
								position === "center" && "justify-center",
								position === "right" && "justify-end pr-12",
								position === "left" && "justify-start pl-12",
							)}
						>
							{/* Unit Node */}
					<button
						onClick={() => !isLocked && onUnitClick(unit.id)}
						disabled={isLocked}
						className={cn(
							"group relative flex flex-col items-center gap-4 transition-all duration-300",
							!isLocked && "cursor-pointer hover:scale-110 hover:-translate-y-1",
							isLocked && "cursor-not-allowed",
						)}
					>		
								{/* Circle */}
								<div
									className={cn(
										"relative flex size-24 items-center justify-center rounded-full border-4 transition-all duration-300",
										isCompleted &&
											"border-green-500 bg-green-500/20 shadow-xl shadow-green-500/30",
										!isCompleted && !isLocked &&
											"border-primary bg-primary/20 shadow-xl shadow-primary/30 group-hover:shadow-2xl group-hover:shadow-primary/40",
										isLocked &&
											"cursor-not-allowed border-muted bg-muted/10",
									)}
								>
									{isCompleted ? (
										<Check className="size-12 text-green-600" strokeWidth={3} />
									) : isLocked ? (
										<Lock className="size-10 text-muted-foreground" />
									) : (
										<Play className="size-10 text-primary" fill="currentColor" />
									)}
									
									{/* Unit number badge */}
									<div
										className={cn(
											"absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border-2 border-background font-bold text-sm shadow-lg",
											isCompleted && "bg-green-500 text-white",
											!isCompleted && !isLocked && "bg-primary text-primary-foreground",
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
			</div>
		</div>

		{/* Empty state */}
		{kurio.units.length === 0 && (
			<div className="mt-12 text-center text-muted-foreground">
				No units available yet
			</div>
		)}
	</div>
)
}

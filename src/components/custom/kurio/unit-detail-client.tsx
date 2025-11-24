"use client"

import { ArrowLeft, Check, Lock, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"

type UnitDetailClientProps = {
	kurioId: string
	unit: {
		id: string
		title: string
		orderIndex: number
		games: Array<{
			id: string
			title: string
			orderIndex: number
			gameType: string
			difficultyLevel: string
		}>
	}
}

export function UnitDetailClient({ kurioId, unit }: UnitDetailClientProps) {
	const router = useRouter()
	const utils = api.useUtils()

	// Prefetch unit progress when component mounts
	useEffect(() => {
		if (unit.id) {
			void utils.game.getUnitProgress.prefetch({ unitId: unit.id })
		}
	}, [unit.id, utils.game.getUnitProgress])

	const { data: unitProgress } = api.game.getUnitProgress.useQuery(
		{
			unitId: unit.id,
		},
		{
			// Only run query if we have a valid unitId
			enabled: !!unit.id,
		},
	)

	const completedGames = unitProgress?.completedGames ?? 0
	const totalGames = unit.games.length
	const progressPercentage =
		totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0

	return (
		<div className="container mx-auto py-8">
			{/* Back button */}
			<Button
				className="mb-6"
				onClick={() => router.push(`/kurio/${kurioId}`)}
				variant="ghost"
			>
				<ArrowLeft className="mr-2 size-4" />
				Back to Journey
			</Button>

			{/* Header */}
			<div className="mb-8 text-center">
				<div className="mb-2 text-muted-foreground text-sm">
					Unit {unit.orderIndex + 1}
				</div>
				<h1 className="font-bold text-3xl">{unit.title}</h1>

				{/* Progress bar */}
				<div className="mx-auto mt-6 max-w-md">
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
						{completedGames} / {totalGames} games completed
					</p>
				</div>
			</div>

			{/* Games grid */}
			<div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{unit.games.map((game, index) => {
					// Check if game is completed
					const isCompleted = completedGames > index
					const isLocked = index > 0 && completedGames < index

					return (
						<Link
							className={cn(
								"group relative overflow-hidden rounded-lg border bg-card p-6",
								isLocked && "cursor-not-allowed opacity-60",
							)}
							href={isLocked ? "#" : `/game/${game.id}`}
							key={game.id}
						>
							{/* Game number badge */}
							<div
								className={cn(
									"absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border-2 font-bold text-xs",
									isCompleted && "border-green-500 bg-green-500 text-white",
									!isCompleted &&
										!isLocked &&
										"border-primary bg-primary text-primary-foreground",
									isLocked && "border-muted bg-muted text-muted-foreground",
								)}
							>
								{index + 1}
							</div>

							{/* Icon */}
							<div className="mb-4 flex justify-center">
								<div
									className={cn(
										"flex size-16 items-center justify-center rounded-full border-4",
										isCompleted &&
											"border-green-500 bg-green-500/20 text-green-600",
										!isCompleted &&
											!isLocked &&
											"border-primary bg-primary/20 text-primary",
										isLocked &&
											"border-muted bg-muted/20 text-muted-foreground",
									)}
								>
									{isCompleted ? (
										<Check className="size-8" strokeWidth={3} />
									) : isLocked ? (
										<Lock className="size-6" />
									) : (
										<Play className="size-6" fill="currentColor" />
									)}
								</div>
							</div>

							{/* Game info */}
							<div className="text-center">
								<h3 className="font-medium text-sm">{game.title}</h3>
								<div className="mt-2 flex items-center justify-center gap-2 text-xs">
									<span
										className={cn(
											"rounded-full px-2 py-0.5",
											game.difficultyLevel === "easy" &&
												"bg-green-500/20 text-green-600",
											game.difficultyLevel === "medium" &&
												"bg-yellow-500/20 text-yellow-600",
											game.difficultyLevel === "hard" &&
												"bg-red-500/20 text-red-600",
										)}
									>
										{game.difficultyLevel}
									</span>
									<span className="text-muted-foreground">
										{game.gameType.replace("_", " ")}
									</span>
								</div>
							</div>

							{/* Locked overlay */}
							{isLocked && (
								<div className="absolute inset-0 flex items-center justify-center bg-background/80">
									<Lock className="size-8 text-muted-foreground" />
								</div>
							)}
						</Link>
					)
				})}
			</div>

			{/* Empty state */}
			{unit.games.length === 0 && (
				<div className="mt-12 text-center text-muted-foreground">
					No games available in this unit
				</div>
			)}
		</div>
	)
}

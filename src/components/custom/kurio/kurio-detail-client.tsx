"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/trpc/react"
import { KurioPathViewer } from "@/components/custom/kurio/kurio-path-viewer"
import { ManageKurioDialog } from "@/components/custom/kurio/manage-kurio-dialog"
import { Spinner } from "@/components/ui/spinner"
import { GamePlayerView } from "@/components/custom/kurio/game-player-view"

type KurioDetailClientProps = {
	kurio: {
		id: string
		title: string
		description: string | null
		status: string
		autoGenEnabled: boolean
		totalGames: number
		resources: Array<{
			id: string
			resourceType: string
			resourceContent: string | null
			resourceFileUrl: string | null
		}>
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

export function KurioDetailClient({ kurio: initialKurio }: KurioDetailClientProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	
	// Poll for updates if generating
	const { data: kurio } = api.kurio.getById.useQuery(
		{ id: initialKurio.id },
		{
			refetchInterval: initialKurio.status === "generating" ? 2000 : false,
		},
	)

	// Use initialKurio if query hasn't loaded yet
	const currentKurio = kurio ?? initialKurio

	// Calculate totalGames from units
	const kurioWithTotal = {
		...currentKurio,
		totalGames: currentKurio.units.reduce(
			(sum, unit) => sum + unit.games.length,
			0,
		),
	}

	// Read from URL (source of truth)
	const unitId = searchParams.get('unit')
	const gameId = searchParams.get('game')
	
	// Local state for animations
	const [direction, setDirection] = useState<'forward' | 'back'>('forward')
	
	// Determine current view
	const currentView = gameId ? 'game' : 'journey'
	
	// Find current unit and game
	const currentUnit = currentKurio.units.find(u => u.id === unitId)
	const currentGame = currentUnit?.games.find(g => g.id === gameId)
	const currentGameIndex = currentUnit?.games.findIndex(g => g.id === gameId) ?? -1
	
	// Navigation functions
	const goToJourney = () => {
		setDirection('back')
		router.push(`/kurio/${currentKurio.id}`)
	}
	
	const goToUnit = (unitId: string) => {
		setDirection('forward')
		// Get first game of the unit
		const unit = currentKurio.units.find(u => u.id === unitId)
		const firstGame = unit?.games[0]
		if (firstGame) {
			router.push(`/kurio/${currentKurio.id}?unit=${unitId}&game=${firstGame.id}`)
		}
	}
	
	const goToNextGame = () => {
		if (!currentUnit || currentGameIndex === -1) return
		
		const nextGame = currentUnit.games[currentGameIndex + 1]
		if (nextGame) {
			setDirection('forward')
			router.push(`/kurio/${currentKurio.id}?unit=${unitId}&game=${nextGame.id}`)
		} else {
			// Go to next unit's first game
			const currentUnitIndex = currentKurio.units.findIndex(u => u.id === unitId)
			const nextUnit = currentKurio.units[currentUnitIndex + 1]
			if (nextUnit && nextUnit.games[0]) {
				setDirection('forward')
				router.push(`/kurio/${currentKurio.id}?unit=${nextUnit.id}&game=${nextUnit.games[0].id}`)
			}
		}
	}
	
	const goToPreviousGame = () => {
		if (!currentUnit || currentGameIndex === -1) return
		
		const prevGame = currentUnit.games[currentGameIndex - 1]
		if (prevGame) {
			setDirection('back')
			router.push(`/kurio/${currentKurio.id}?unit=${unitId}&game=${prevGame.id}`)
		}
	}
	
	// Check if there's next/previous game
	const hasNextGame = () => {
		if (!currentUnit || currentGameIndex === -1) return false
		if (currentGameIndex < currentUnit.games.length - 1) return true
		
		const currentUnitIndex = currentKurio.units.findIndex(u => u.id === unitId)
		const nextUnit = currentKurio.units[currentUnitIndex + 1]
		return !!nextUnit && nextUnit.games.length > 0
	}
	
	const hasPreviousGame = () => {
		return currentGameIndex > 0
	}

	return (
		<div className="relative min-h-screen">
			<div className="container relative mx-auto px-4">
				<ManageKurioDialog
					kurio={{
						id: currentKurio.id,
						title: currentKurio.title,
						description: currentKurio.description,
						autoGenEnabled: currentKurio.autoGenEnabled,
					}}
				/>
			</div>
			
			<AnimatePresence mode="wait" initial={false}>
				{currentView === 'journey' && currentKurio.status === "ready" && currentKurio.units.length > 0 ? (
					<motion.div
						key="journey"
						initial={{ x: direction === 'forward' ? -100 : 100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: direction === 'forward' ? -100 : 100, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<KurioPathViewer kurio={kurioWithTotal} onUnitClick={goToUnit} />
					</motion.div>
				) : currentView === 'game' && currentGame && currentUnit ? (
					<motion.div
						key={`game-${gameId}`}
						initial={{ x: direction === 'forward' ? 100 : -100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: direction === 'forward' ? 100 : -100, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="container mx-auto px-4 py-4 sm:py-6 md:py-8"
					>
						<GamePlayerView
							gameId={currentGame.id}
							unitTitle={currentUnit.title}
							gameTitle={currentGame.title}
							onBack={goToJourney}
							onNext={hasNextGame() ? goToNextGame : undefined}
							onPrevious={hasPreviousGame() ? goToPreviousGame : undefined}
						/>
					</motion.div>
				) : (
					<div className="container mx-auto py-8 text-center">
						<h1 className="font-bold text-3xl">{currentKurio.title}</h1>
						{currentKurio.description && (
							<p className="mt-2 text-muted-foreground">{currentKurio.description}</p>
						)}
						
						{currentKurio.status === "generating" ? (
							<div className="mt-12 flex flex-col items-center gap-4">
								<Spinner className="size-12" />
								<div className="space-y-2">
									<p className="font-medium text-lg">Creating your learning journey...</p>
									<p className="text-muted-foreground text-sm">
										This may take a few minutes. Feel free to stay on this page.
									</p>
								</div>
							</div>
						) : (
							<p className="mt-8 text-muted-foreground">
								{currentKurio.status === "error"
									? "Failed to generate games. Please try again."
									: "No games available yet"}
							</p>
						)}
					</div>
				)}
			</AnimatePresence>
		</div>
	)
}

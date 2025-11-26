"use client"

import type { RealtimeChannel } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

type UseKurioRealtimeOptions = {
	kurioId: string
	enabled?: boolean
	onUnitCreated?: (payload: {
		unitId: string
		title: string
		index: number
	}) => void
	onUnitsComplete?: (payload: { unitCount: number }) => void
	onUnitGamesComplete?: (payload: {
		unitId: string
		gameCount: number
		progress: number
	}) => void
	onCourseMetadataUpdated?: (payload: {
		title: string
		description: string
	}) => void
	onGenerationComplete?: (payload: { kurioId: string }) => void
}

type UseKurioRealtimeReturn = {
	progress: number
	isGenerating: boolean
	isComplete: boolean
}

export function useKurioRealtime(
	options: UseKurioRealtimeOptions,
): UseKurioRealtimeReturn {
	const {
		kurioId,
		enabled = true,
		onUnitCreated,
		onUnitsComplete,
		onUnitGamesComplete,
		onCourseMetadataUpdated,
		onGenerationComplete,
	} = options

	const [progress, setProgress] = useState(0)
	const [isGenerating, setIsGenerating] = useState(false)
	const [isComplete, setIsComplete] = useState(false)
	const supabase = createBrowserSupabaseClient()

	useEffect(() => {
		if (!enabled || !kurioId) {
			return
		}

		const channel: RealtimeChannel = supabase
			.channel(`kurio:${kurioId}`)
			.on(
				"broadcast",
				{ event: "unit_created" },
				(payload: {
					payload: { unitId: string; title: string; index: number }
				}) => {
					setIsGenerating(true)
					onUnitCreated?.(payload.payload)
				},
			)
			.on(
				"broadcast",
				{ event: "units_complete" },
				(payload: { payload: { unitCount: number } }) => {
					onUnitsComplete?.(payload.payload)
				},
			)
			.on(
				"broadcast",
				{ event: "unit_games_complete" },
				(payload: {
					payload: { unitId: string; gameCount: number; progress: number }
				}) => {
					setProgress(payload.payload.progress)
					onUnitGamesComplete?.(payload.payload)
				},
			)
			.on(
				"broadcast",
				{ event: "course_metadata_updated" },
				(payload: { payload: { title: string; description: string } }) => {
					onCourseMetadataUpdated?.(payload.payload)
				},
			)
			.on(
				"broadcast",
				{ event: "generation_complete" },
				(payload: { payload: { kurioId: string } }) => {
					setIsGenerating(false)
					setIsComplete(true)
					setProgress(100)
					onGenerationComplete?.(payload.payload)
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [
		kurioId,
		enabled,
		supabase,
		onUnitCreated,
		onUnitsComplete,
		onUnitGamesComplete,
		onCourseMetadataUpdated,
		onGenerationComplete,
	])

	return {
		progress,
		isGenerating,
		isComplete,
	}
}

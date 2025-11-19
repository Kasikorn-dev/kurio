import { useEffect, useRef, useState } from "react"
import { TIMING_CONSTANTS } from "@/lib/constants"

type UseExerciseTimerReturn = {
	timeSpent: number
	start: () => void
	stop: () => void
	reset: () => void
}

export function useExerciseTimer(): UseExerciseTimerReturn {
	const [timeSpent, setTimeSpent] = useState(0)
	const startTimeRef = useRef<number | null>(null)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	const start = () => {
		if (startTimeRef.current === null) {
			startTimeRef.current = Date.now()
			intervalRef.current = setInterval(() => {
				if (startTimeRef.current) {
					setTimeSpent(
						Math.floor(
							(Date.now() - startTimeRef.current) /
								TIMING_CONSTANTS.MS_TO_SECONDS,
						),
					)
				}
			}, TIMING_CONSTANTS.MS_TO_SECONDS)
		}
	}

	const stop = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
		if (startTimeRef.current) {
			const finalTime = Math.floor(
				(Date.now() - startTimeRef.current) / TIMING_CONSTANTS.MS_TO_SECONDS,
			)
			setTimeSpent(finalTime)
			startTimeRef.current = null
		}
	}

	const reset = () => {
		stop()
		setTimeSpent(0)
	}

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [])

	return { timeSpent, start, stop, reset }
}

import { useCallback, useEffect, useRef, useState } from "react"

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

	const start = useCallback(() => {
		if (!startTimeRef.current) {
			startTimeRef.current = Date.now()
			intervalRef.current = setInterval(() => {
				if (startTimeRef.current) {
					setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000))
				}
			}, 1000)
		}
	}, [])

	const stop = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
		if (startTimeRef.current) {
			const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
			setTimeSpent(finalTime)
		}
	}, [])

	const reset = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
		startTimeRef.current = null
		setTimeSpent(0)
	}, [])

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [])

	return { timeSpent, start, stop, reset }
}

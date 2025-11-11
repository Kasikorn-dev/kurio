import { useEffect, useRef, useState } from "react"

export function useExerciseTimer() {
	const [timeSpent, setTimeSpent] = useState(0)
	const startTimeRef = useRef<number | null>(null)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	const start = () => {
		if (startTimeRef.current === null) {
			startTimeRef.current = Date.now()
			intervalRef.current = setInterval(() => {
				if (startTimeRef.current) {
					setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000))
				}
			}, 1000)
		}
	}

	const stop = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
		if (startTimeRef.current) {
			const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
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

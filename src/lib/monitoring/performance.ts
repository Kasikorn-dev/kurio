/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
	fn: () => Promise<T> | T,
	label?: string,
): Promise<{ result: T; duration: number }> {
	const start = performance.now()
	const result = await fn()
	const duration = performance.now() - start

	if (label) {
		console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
	}

	return { result, duration }
}

/**
 * Performance mark for measuring specific points
 */
export function markPerformance(name: string): void {
	if (typeof performance !== "undefined" && performance.mark) {
		performance.mark(name)
	}
}

/**
 * Measure between two performance marks
 */
export function measureBetweenMarks(
	measureName: string,
	startMark: string,
	endMark: string,
): number | null {
	if (typeof performance !== "undefined" && performance.measure) {
		try {
			performance.measure(measureName, startMark, endMark)
			const measure = performance.getEntriesByName(measureName)[0]
			return measure?.duration ?? null
		} catch {
			return null
		}
	}
	return null
}

/**
 * Report Web Vitals (for client-side)
 * Use with Next.js reportWebVitals in _app.tsx
 */
export type WebVitalsMetric = {
	id: string
	name: string
	label: "web-vital" | "custom"
	value: number
}

export function reportWebVitals(metric: WebVitalsMetric): void {
	console.log("[Web Vitals]", metric.name, metric.value)

	// TODO: Send to analytics service
	// if (typeof window !== "undefined" && window.gtag) {
	//   window.gtag("event", metric.name, {
	//     value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
	//     event_label: metric.id,
	//     non_interaction: true,
	//   })
	// }
}

/**
 * Simple performance timer class
 */
export class PerformanceTimer {
	private startTime: number
	private marks: Map<string, number> = new Map()

	constructor() {
		this.startTime = performance.now()
	}

	mark(label: string): void {
		this.marks.set(label, performance.now() - this.startTime)
	}

	getMark(label: string): number | undefined {
		return this.marks.get(label)
	}

	getElapsed(): number {
		return performance.now() - this.startTime
	}

	getAllMarks(): Record<string, number> {
		return Object.fromEntries(this.marks)
	}

	reset(): void {
		this.startTime = performance.now()
		this.marks.clear()
	}
}

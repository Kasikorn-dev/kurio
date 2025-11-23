type AnalyticsEvent = {
	name: string
	properties?: Record<string, unknown>
	userId?: string
	timestamp?: Date
}

type PageViewEvent = {
	path: string
	title?: string
	userId?: string
	referrer?: string
}

type TimingEvent = {
	category: string
	variable: string
	value: number
	label?: string
}

/**
 * Analytics tracking utility
 * In production, integrate with your analytics service (Google Analytics, Mixpanel, etc.)
 */
class Analytics {
	private isEnabled = typeof window !== "undefined"

	/**
	 * Track custom events
	 */
	trackEvent(event: AnalyticsEvent): void {
		if (!this.isEnabled) return

		const eventData = {
			...event,
			timestamp: event.timestamp ?? new Date(),
		}

		// Development: Log to console
		console.log("[Analytics] Event:", eventData)

		// TODO: Send to analytics service
		// if (typeof window !== "undefined" && window.gtag) {
		//   window.gtag("event", event.name, event.properties)
		// }
	}

	/**
	 * Track page views
	 */
	trackPageView(pageView: PageViewEvent): void {
		if (!this.isEnabled) return

		console.log("[Analytics] Page View:", pageView)

		// TODO: Send to analytics service
		// if (typeof window !== "undefined" && window.gtag) {
		//   window.gtag("config", "GA_MEASUREMENT_ID", {
		//     page_path: pageView.path,
		//     page_title: pageView.title,
		//   })
		// }
	}

	/**
	 * Track timing/performance metrics
	 */
	trackTiming(timing: TimingEvent): void {
		if (!this.isEnabled) return

		console.log("[Analytics] Timing:", timing)

		// TODO: Send to analytics service
		// if (typeof window !== "undefined" && window.gtag) {
		//   window.gtag("event", "timing_complete", {
		//     name: timing.variable,
		//     value: timing.value,
		//     event_category: timing.category,
		//     event_label: timing.label,
		//   })
		// }
	}

	/**
	 * Track user actions
	 */
	trackUserAction(action: string, properties?: Record<string, unknown>): void {
		this.trackEvent({
			name: `user_${action}`,
			properties,
		})
	}

	/**
	 * Track errors
	 */
	trackError(error: Error, context?: Record<string, unknown>): void {
		this.trackEvent({
			name: "error",
			properties: {
				message: error.message,
				stack: error.stack,
				...context,
			},
		})
	}
}

export const analytics = new Analytics()

// Helper functions for common tracking scenarios
export function trackKurioCreated(kurioId: string, userId: string): void {
	analytics.trackUserAction("kurio_created", { kurioId, userId })
}

export function trackGameCompleted(
	gameId: string,
	score: number,
	timeSpent: number,
): void {
	analytics.trackUserAction("game_completed", { gameId, score, timeSpent })
}

export function trackUnitCompleted(unitId: string, userId: string): void {
	analytics.trackUserAction("unit_completed", { unitId, userId })
}

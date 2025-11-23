type LogLevel = "info" | "warn" | "error" | "debug"

type LogContext = {
	userId?: string
	path?: string
	method?: string
	duration?: number
	statusCode?: number
	[key: string]: unknown
}

/**
 * Centralized logging utility
 * In production, replace console.log with your logging service (e.g., Sentry, DataDog)
 */
class Logger {
	private isDevelopment = process.env.NODE_ENV === "development"

	private formatMessage(
		level: LogLevel,
		message: string,
		context?: LogContext,
	): string {
		const timestamp = new Date().toISOString()
		const contextStr = context ? ` | ${JSON.stringify(context)}` : ""
		return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
	}

	info(message: string, context?: LogContext): void {
		console.log(this.formatMessage("info", message, context))
	}

	warn(message: string, context?: LogContext): void {
		console.warn(this.formatMessage("warn", message, context))
	}

	error(message: string, error?: Error | unknown, context?: LogContext): void {
		const errorContext = {
			...context,
			error:
				error instanceof Error
					? {
							message: error.message,
							stack: this.isDevelopment ? error.stack : undefined,
							name: error.name,
						}
					: error,
		}
		console.error(this.formatMessage("error", message, errorContext))

		// TODO: Send to error tracking service (Sentry, LogRocket, etc.)
		// if (process.env.NODE_ENV === "production") {
		//   Sentry.captureException(error, { extra: context })
		// }
	}

	debug(message: string, context?: LogContext): void {
		if (this.isDevelopment) {
			console.debug(this.formatMessage("debug", message, context))
		}
	}

	/**
	 * Log slow queries or operations
	 */
	logSlowOperation(
		operation: string,
		duration: number,
		threshold = 1000,
		context?: LogContext,
	): void {
		if (duration > threshold) {
			this.warn(`Slow operation: ${operation}`, {
				...context,
				duration,
				threshold,
			})
		}
	}

	/**
	 * Log performance metrics
	 */
	logPerformance(metric: string, value: number, context?: LogContext): void {
		this.info(`Performance: ${metric}`, {
			...context,
			value,
			unit: "ms",
		})
	}
}

export const logger = new Logger()

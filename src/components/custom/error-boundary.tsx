"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/monitoring/logger"

type ErrorBoundaryProps = {
	children: ReactNode
	fallback?: ReactNode
}

type ErrorBoundaryState = {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error with context
		logger.error("ErrorBoundary caught an error", error, {
			componentStack: errorInfo.componentStack,
			errorBoundary: true,
		})
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			// Don't expose error message to prevent information leakage
			return (
				<div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
					<h2 className="font-bold text-2xl">Something went wrong</h2>
					<p className="text-muted-foreground">
						An unexpected error occurred. Please try again later.
					</p>
					<Button
						onClick={() => {
							this.setState({ hasError: false, error: null })
							window.location.reload()
						}}
					>
						Try Again
					</Button>
				</div>
			)
		}

		return this.props.children
	}
}

"use client"

import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		// Trigger fade-in animation after mount
		const timer = setTimeout(() => setIsVisible(true), 10)
		return () => clearTimeout(timer)
	}, [])

	return (
		<div
			className={`flex min-h-screen items-center justify-center transition-opacity duration-300 ${
				isVisible ? "opacity-100" : "opacity-0"
			}`}
		>
			<div className="flex flex-col items-center gap-6">
				<Spinner className="size-10 animate-spin" />
				<div className="flex flex-col items-center gap-2">
					<p className="font-medium text-muted-foreground text-sm">
						Loading...
					</p>
					{/* Loading dots animation */}
					<div className="flex gap-1">
						<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
						<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
						<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
					</div>
				</div>
			</div>
		</div>
	)
}

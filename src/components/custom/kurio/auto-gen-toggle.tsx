"use client"

import { Sparkles } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AutoGenToggleProps = {
	enabled: boolean
	onToggle: (enabled: boolean) => void
	className?: string
} & Omit<React.ComponentProps<typeof Button>, "onToggle">

export function AutoGenToggle({
	enabled,
	onToggle,
	className,
	onClick,
	...props
}: AutoGenToggleProps) {
	return (
		<Button
			className={cn(
				"size-8 shrink-0 transition-colors",
				enabled &&
					"bg-black text-white shadow-sm dark:bg-white/90 dark:text-background dark:hover:text-white/80",
				className,
			)}
			onClick={(e) => {
				onToggle(!enabled)
				onClick?.(e)
			}}
			size="icon"
			type="button"
			variant="ghost"
			{...props}
		>
			<Sparkles className="size-4" />
		</Button>
	)
}

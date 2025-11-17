"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AutoGenToggleProps = {
	enabled: boolean
	onToggle: (enabled: boolean) => void
	className?: string
}

export function AutoGenToggle({
	enabled,
	onToggle,
	className,
}: AutoGenToggleProps) {
	return (
		<Button
			className={cn(
				"size-10 transition-all",
				enabled
					? "bg-primary text-primary-foreground"
					: "bg-muted text-muted-foreground",
				className,
			)}
			onClick={() => onToggle(!enabled)}
			size="icon"
			type="button"
			variant="ghost"
		>
			<Sparkles className="size-5" />
		</Button>
	)
}

"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
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
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					className={cn(
						"size-10 rounded-full transition-all",
						enabled
							? "bg-primary text-primary-foreground hover:bg-primary/90"
							: "bg-muted text-muted-foreground hover:bg-muted/80",
						className,
					)}
					onClick={() => onToggle(!enabled)}
					size="icon"
					type="button"
					variant="ghost"
				>
					<Sparkles className="size-5" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top">
				<p className="text-xs">
					Auto-generate games when player reaches 80% completion
				</p>
			</TooltipContent>
		</Tooltip>
	)
}

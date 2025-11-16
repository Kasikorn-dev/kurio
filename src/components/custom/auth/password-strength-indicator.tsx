"use client"

import {
	calculatePasswordStrength,
	type PasswordStrength,
} from "@/lib/auth/password-strength"
import { cn } from "@/lib/utils"

type PasswordStrengthIndicatorProps = {
	password: string
	className?: string
}

export function PasswordStrengthIndicator({
	password,
	className,
}: PasswordStrengthIndicatorProps) {
	if (!password) {
		return null
	}

	const { strength, score, suggestions } = calculatePasswordStrength(password)

	const strengthColors: Record<PasswordStrength, string> = {
		weak: "bg-destructive",
		medium: "bg-yellow-500",
		strong: "bg-green-500",
	}

	const strengthLabels: Record<PasswordStrength, string> = {
		weak: "Weak",
		medium: "Medium",
		strong: "Strong",
	}

	const bars = Array.from({ length: 5 }, (_, i) => i)

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex items-center gap-2">
				<div className="flex flex-1 gap-1">
					{bars.map((barIndex) => (
						<div
							className={cn(
								"h-1 flex-1 rounded-full transition-colors",
								barIndex < score ? strengthColors[strength] : "bg-muted",
							)}
							key={`strength-bar-${barIndex}`}
						/>
					))}
				</div>
				<span
					className={cn(
						"font-medium text-xs",
						strength === "weak" && "text-destructive",
						strength === "medium" && "text-yellow-600 dark:text-yellow-500",
						strength === "strong" && "text-green-600 dark:text-green-500",
					)}
				>
					{strengthLabels[strength]}
				</span>
			</div>
			{suggestions.length > 0 && strength !== "strong" && (
				<ul className="space-y-1 text-muted-foreground text-xs">
					{suggestions.map((suggestion) => (
						<li className="flex items-start gap-1" key={suggestion}>
							<span>•</span>
							<span>{suggestion}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

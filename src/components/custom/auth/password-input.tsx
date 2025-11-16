"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PasswordInputProps extends React.ComponentProps<"input"> {
	className?: string
}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<div className="relative">
			<Input
				{...props}
				className={cn("pr-10", className)}
				type={showPassword ? "text" : "password"}
			/>
			<Button
				aria-label={showPassword ? "Hide password" : "Show password"}
				className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
				disabled={props.disabled}
				onClick={() => setShowPassword(!showPassword)}
				size="sm"
				type="button"
				variant="ghost"
			>
				{showPassword ? (
					<EyeOff className="h-4 w-4 text-muted-foreground" />
				) : (
					<Eye className="h-4 w-4 text-muted-foreground" />
				)}
			</Button>
		</div>
	)
}


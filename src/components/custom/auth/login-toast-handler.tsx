"use client"

import { useEffect } from "react"
import { toast } from "sonner"

type LoginToastHandlerProps = {
	error?: string | null
	info?: string | null
	message?: string | null
}

export function LoginToastHandler({
	error,
	info,
	message,
}: LoginToastHandlerProps) {
	useEffect(() => {
		if (error && message) {
			toast.error(decodeURIComponent(message))
		} else if (info && message) {
			toast.info(decodeURIComponent(message))
		}
	}, [error, info, message])

	return null
}

"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/trpc/react"

type GenerateGameButtonProps = {
	kurioId: string
}

export function GenerateGameButton({ kurioId }: GenerateGameButtonProps) {
	const generateGame = api.game.generateGame.useMutation({
		onSuccess: () => {
			toast.success("Game generated successfully!")
		},
		onError: (error) => {
			toast.error(error.message || "Failed to generate game")
		},
	})

	const handleGenerate = async () => {
		await generateGame.mutateAsync({ kurioId })
	}

	return (
		<Button
			disabled={generateGame.isPending}
			onClick={handleGenerate}
			variant="default"
		>
			{generateGame.isPending && <Spinner className="mr-2 size-4" />}
			{generateGame.isPending ? "Generating..." : "Generate Game"}
		</Button>
	)
}

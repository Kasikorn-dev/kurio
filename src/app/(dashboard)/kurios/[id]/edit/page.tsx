"use client"

import { useParams, useRouter } from "next/navigation"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function EditKurioPage() {
	const params = useParams()
	const router = useRouter()
	const kurioId = params.id as string

	const { data: kurio, isLoading } = api.kurio.getById.useQuery(
		{ id: kurioId },
		{ enabled: !!kurioId },
	)

	const updateKurio = api.kurio.update.useMutation({
		onSuccess: () => {
			router.push(`/kurios/${kurioId}`)
		},
	})

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!kurio) {
		return <div>Kurio not found</div>
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)

		await updateKurio.mutateAsync({
			id: kurioId,
			title: formData.get("title") as string,
			description: (formData.get("description") as string) || undefined,
			difficultyLevel: (formData.get("difficultyLevel") as "easy" | "medium" | "hard" | "mixed") || undefined,
		})
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 text-3xl font-bold">Edit Kurio</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						name="title"
						defaultValue={kurio.title}
						required
						disabled={updateKurio.isPending}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						name="description"
						defaultValue={kurio.description || ""}
						disabled={updateKurio.isPending}
					/>
				</div>
				<Button type="submit" disabled={updateKurio.isPending}>
					{updateKurio.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</form>
		</div>
	)
}


"use client"

import { useParams, useRouter } from "next/navigation"
import { KurioEditSkeleton } from "@/components/custom/kurio/kurio-edit-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/trpc/react"

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
		return <KurioEditSkeleton />
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
			difficultyLevel:
				(formData.get("difficultyLevel") as
					| "easy"
					| "medium"
					| "hard"
					| "mixed") || undefined,
		})
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 font-bold text-3xl">Edit Kurio</h1>
			<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
				<div className="flex flex-col gap-2">
					<Label htmlFor="title">Title</Label>
					<Input
						defaultValue={kurio.title}
						disabled={updateKurio.isPending}
						id="title"
						name="title"
						required
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						defaultValue={kurio.description || ""}
						disabled={updateKurio.isPending}
						id="description"
						name="description"
					/>
				</div>
				<Button disabled={updateKurio.isPending} type="submit">
					{updateKurio.isPending && <Spinner className="mr-2 size-4" />}
					{updateKurio.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</form>
		</div>
	)
}

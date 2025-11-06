"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useKurioStore } from "@/stores/kurio-store"
import type { Resource } from "@/stores/kurio-store"
import { X } from "lucide-react"

export function InputSelector() {
	const { resources, addResource, removeResource, updateResource } =
		useKurioStore()
	const [newResourceType, setNewResourceType] = useState<
		"text" | "file" | "image"
	>("text")
	const [newResourceContent, setNewResourceContent] = useState("")

	const handleAddTextResource = () => {
		if (!newResourceContent.trim()) return

		addResource({
			resourceType: "text",
			resourceContent: newResourceContent,
			orderIndex: resources.length,
		})
		setNewResourceContent("")
	}

	const handleAddFileResource = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// File upload will be handled by upload API route
		// For now, we'll just add a placeholder
		addResource({
			resourceType: file.type.startsWith("image/") ? "image" : "file",
			resourceFileUrl: URL.createObjectURL(file),
			resourceFileType: file.type,
			orderIndex: resources.length,
		})
	}

	return (
		<div className="flex flex-col gap-4">
			<Label>Resources</Label>

			{/* Existing Resources */}
			<div className="flex flex-col gap-2">
				{resources.map((resource, index) => (
					<div
						key={index}
						className="flex items-center gap-2 rounded-md border p-2"
					>
						<div className="flex-1">
							{resource.resourceType === "text" && (
								<p className="text-sm">{resource.resourceContent}</p>
							)}
							{(resource.resourceType === "file" ||
								resource.resourceType === "image") && (
								<p className="text-sm">{resource.resourceFileUrl}</p>
							)}
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => removeResource(index)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>

			{/* Add New Resource */}
			<div className="flex flex-col gap-2">
				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => setNewResourceType("text")}
					>
						Add Text
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => setNewResourceType("file")}
					>
						Add File
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => setNewResourceType("image")}
					>
						Add Image
					</Button>
				</div>

				{newResourceType === "text" && (
					<div className="flex gap-2">
						<Textarea
							placeholder="Enter text content..."
							value={newResourceContent}
							onChange={(e) => setNewResourceContent(e.target.value)}
						/>
						<Button type="button" onClick={handleAddTextResource}>
							Add
						</Button>
					</div>
				)}

				{(newResourceType === "file" || newResourceType === "image") && (
					<Input
						type="file"
						accept={
							newResourceType === "image"
								? "image/*"
								: "application/pdf,.doc,.docx,.txt"
						}
						onChange={handleAddFileResource}
					/>
				)}
			</div>
		</div>
	)
}


"use client"

import { X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useKurioStore } from "@/stores/kurio-store"

export function InputSelector() {
	const { resources, addResource, removeResource } = useKurioStore()
	const { uploadFile, isUploading } = useFileUpload()
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

	const handleAddFileResource = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0]
		if (!file) return

		const uploadResult = await uploadFile(file)
		if (uploadResult) {
			addResource({
				resourceType: file.type.startsWith("image/") ? "image" : "file",
				resourceFileUrl: uploadResult.url,
				resourceFileType: file.type,
				orderIndex: resources.length,
			})
		}

		// Reset input
		e.target.value = ""
	}

	return (
		<div className="flex flex-col gap-4">
			<Label>Resources</Label>

			{/* Existing Resources */}
			<div className="flex flex-col gap-2">
				{resources.map((resource, index) => (
					<div
						className="flex items-center gap-2 rounded-md border p-2"
						key={index}
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
							onClick={() => removeResource(index)}
							size="icon"
							type="button"
							variant="ghost"
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
						onClick={() => setNewResourceType("text")}
						type="button"
						variant="outline"
					>
						Add Text
					</Button>
					<Button
						onClick={() => setNewResourceType("file")}
						type="button"
						variant="outline"
					>
						Add File
					</Button>
					<Button
						onClick={() => setNewResourceType("image")}
						type="button"
						variant="outline"
					>
						Add Image
					</Button>
				</div>

				{newResourceType === "text" && (
					<div className="flex gap-2">
						<Textarea
							onChange={(e) => setNewResourceContent(e.target.value)}
							placeholder="Enter text content..."
							value={newResourceContent}
						/>
						<Button onClick={handleAddTextResource} type="button">
							Add
						</Button>
					</div>
				)}

				{(newResourceType === "file" || newResourceType === "image") && (
					<div className="flex items-center gap-2">
						<Input
							accept={
								newResourceType === "image"
									? "image/*"
									: "application/pdf,.doc,.docx,.txt"
							}
							disabled={isUploading}
							onChange={handleAddFileResource}
							type="file"
						/>
						{isUploading && <Spinner className="size-4" />}
					</div>
				)}
			</div>
		</div>
	)
}

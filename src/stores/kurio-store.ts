import { create } from "zustand"

type Resource = {
	id?: string
	resourceType: "text" | "file" | "image"
	resourceContent?: string
	resourceFileUrl?: string
	resourceFileType?: string
	orderIndex: number
}

type KurioFormState = {
	title: string
	description: string
	difficultyLevel: "easy" | "medium" | "hard" | "mixed"
	autoGenEnabled: boolean
	autoGenThreshold: number
	resources: Resource[]
	addResource: (resource: Resource) => void
	removeResource: (index: number) => void
	updateResource: (index: number, resource: Partial<Resource>) => void
	setTitle: (title: string) => void
	setDescription: (description: string) => void
	setDifficultyLevel: (level: "easy" | "medium" | "hard" | "mixed") => void
	setAutoGenEnabled: (enabled: boolean) => void
	setAutoGenThreshold: (threshold: number) => void
	reset: () => void
}

const initialState = {
	title: "",
	description: "",
	difficultyLevel: "medium" as const,
	autoGenEnabled: true,
	autoGenThreshold: 75,
	resources: [] as Resource[],
}

export const useKurioStore = create<KurioFormState>((set) => ({
	...initialState,
	addResource: (resource) =>
		set((state) => ({
			resources: [...state.resources, resource],
		})),
	removeResource: (index) =>
		set((state) => ({
			resources: state.resources.filter((_, i) => i !== index),
		})),
	updateResource: (index, resource) =>
		set((state) => ({
			resources: state.resources.map((r, i) =>
				i === index ? { ...r, ...resource } : r,
			),
		})),
	setTitle: (title) => set({ title }),
	setDescription: (description) => set({ description }),
	setDifficultyLevel: (difficultyLevel) => set({ difficultyLevel }),
	setAutoGenEnabled: (autoGenEnabled) => set({ autoGenEnabled }),
	setAutoGenThreshold: (autoGenThreshold) => set({ autoGenThreshold }),
	reset: () => set(initialState),
}))

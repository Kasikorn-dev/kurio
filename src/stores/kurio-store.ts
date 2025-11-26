import { create } from "zustand"

type Resource = {
	id?: string
	resourceType: "text" | "file" | "image"
	resourceContent?: string
	resourceFileUrl?: string // URL จาก storage (หลัง upload) หรือ object URL (ก่อน upload)
	resourceFileType?: string
	resourceFile?: File // File object สำหรับไฟล์ที่ยังไม่ได้ upload
	previewUrl?: string // Object URL สำหรับ preview (ต้อง revoke เมื่อไม่ใช้)
	orderIndex: number
}

type KurioFormState = {
	autoGenEnabled: boolean
	autoGenThreshold: number
	unitCount: number | undefined
	resources: Resource[]
	addResource: (resource: Resource) => void
	removeResource: (index: number) => void
	updateResource: (index: number, resource: Partial<Resource>) => void
	setAutoGenEnabled: (enabled: boolean) => void
	setAutoGenThreshold: (threshold: number) => void
	setUnitCount: (count: number | undefined) => void
	reset: () => void
}

const initialState = {
	autoGenEnabled: true,
	autoGenThreshold: 80,
	unitCount: undefined as number | undefined,
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
	setAutoGenEnabled: (autoGenEnabled) => set({ autoGenEnabled }),
	setAutoGenThreshold: (autoGenThreshold) => set({ autoGenThreshold }),
	setUnitCount: (unitCount) => set({ unitCount }),
	reset: () => set(initialState),
}))

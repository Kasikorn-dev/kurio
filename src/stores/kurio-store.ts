import { create } from "zustand"
import type { ResourceType } from "@/components/custom/kurio/types"

type Resource = {
	id?: string
	type: ResourceType
	content?: string
	fileUrl?: string // URL จาก storage (หลัง upload) หรือ object URL (ก่อน upload)
	fileType?: string
	file?: File // File object สำหรับไฟล์ที่ยังไม่ได้ upload
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
	unitCount: 2,
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

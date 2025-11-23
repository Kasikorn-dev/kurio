export type GeneratedGame = {
        title: string
        gameType: "quiz" | "matching" | "fill_blank" | "multiple_choice"
        difficultyLevel: "easy" | "medium" | "hard"
        content: Record<string, unknown>
}

export type GeneratedUnit = {
        title: string
        games: GeneratedGame[]
}

export type BatchedUnits = {
        unitIndices: number[]
        units: GeneratedUnit[]
}

export function createUnitBatches(unitCount: number, batchSize: number): number[][] {
        const batches: number[][] = []
        for (let i = 1; i <= unitCount; i += batchSize) {
                const batch: number[] = []
                for (let j = i; j < i + batchSize && j <= unitCount; j++) {
                        batch.push(j)
                }
                batches.push(batch)
        }
        return batches
}

export function mergeUnitsFromBatches(batchResults: BatchedUnits[], unitCount: number): GeneratedUnit[] {
        const ordered: Array<GeneratedUnit | undefined> = Array.from({ length: unitCount })
        for (const batch of batchResults) {
                batch.unitIndices.forEach((unitIndex, idx) => {
                        const targetIndex = unitIndex - 1
                        ordered[targetIndex] = batch.units[idx]
                })
        }

        if (ordered.some((unit) => !unit)) {
                throw new Error("Missing unit(s) from batch generation")
        }

        return ordered as GeneratedUnit[]
}

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
        createUnitBatches,
        mergeUnitsFromBatches,
        type GeneratedUnit,
} from "../src/lib/ai/game-generator-helpers.js"

describe("createUnitBatches", () => {
        it("splits units into evenly sized batches with a remainder batch", () => {
                const batches = createUnitBatches(7, 3)

                assert.deepEqual(batches, [
                        [1, 2, 3],
                        [4, 5, 6],
                        [7],
                ])
        })
})

describe("mergeUnitsFromBatches", () => {
        it("merges batches back to the original order regardless of arrival order", () => {
                const merged = mergeUnitsFromBatches(
                        [
                                {
                                        unitIndices: [4, 5],
                                        units: [
                                                {
                                                        title: "Fourth",
                                                        games: [
                                                                {
                                                                        title: "g4",
                                                                        gameType: "quiz" as const,
                                                                        difficultyLevel: "easy" as const,
                                                                        content: {},
                                                                },
                                                        ],
                                                },
                                                {
                                                        title: "Fifth",
                                                        games: [
                                                                {
                                                                        title: "g5",
                                                                        gameType: "quiz" as const,
                                                                        difficultyLevel: "easy" as const,
                                                                        content: {},
                                                                },
                                                        ],
                                                },
                                        ],
                                },
                                {
                                        unitIndices: [1, 2, 3],
                                        units: [
                                                {
                                                        title: "First",
                                                        games: [
                                                                {
                                                                        title: "g1",
                                                                        gameType: "quiz" as const,
                                                                        difficultyLevel: "easy" as const,
                                                                        content: {},
                                                                },
                                                        ],
                                                },
                                                {
                                                        title: "Second",
                                                        games: [
                                                                {
                                                                        title: "g2",
                                                                        gameType: "matching" as const,
                                                                        difficultyLevel: "medium" as const,
                                                                        content: {},
                                                                },
                                                        ],
                                                },
                                                {
                                                        title: "Third",
                                                        games: [
                                                                {
                                                                        title: "g3",
                                                                        gameType: "fill_blank" as const,
                                                                        difficultyLevel: "hard" as const,
                                                                        content: {},
                                                                },
                                                        ],
                                                },
                                        ],
                                },
                        ],
                        5,
                )

                assert.equal(merged[0]?.title, "First")
                assert.equal(merged[1]?.title, "Second")
                assert.equal(merged[2]?.title, "Third")
                assert.equal(merged[3]?.title, "Fourth")
                assert.equal(merged[4]?.title, "Fifth")

                const flattened = merged.flatMap((unit: GeneratedUnit) =>
                        unit.games.map((game) => game.title),
                )
                assert.deepEqual(flattened, ["g1", "g2", "g3", "g4", "g5"])
        })

        it("throws when expected units are missing", () => {
                assert.throws(() =>
                        mergeUnitsFromBatches(
                                [
                                        { unitIndices: [1], units: [{ title: "Only", games: [] }] },
                                ],
                                2,
                        ),
                )
        })
})

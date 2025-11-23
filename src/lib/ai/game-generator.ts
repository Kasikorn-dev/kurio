import { AI_CONSTANTS } from "@/lib/constants"
import { logger } from "@/lib/monitoring/logger"
import { SAFETY_SYSTEM_PROMPT, validateContentSafety } from "./content-safety"
import {
        createUnitBatches,
        mergeUnitsFromBatches,
        type BatchedUnits,
        type GeneratedUnit,
} from "./game-generator-helpers"
import { openai } from "./openai-client"

type Resource = {
        resourceType: "text" | "file" | "image"
        resourceContent?: string
        resourceFileUrl?: string
}

type GenerateGameParams = {
        resources: Resource[]
        aiModel?: string
        unitCount: number
        gamesPerUnit: number
        batchSize?: number
        parallelLimit?: number
        maxRetries?: number
        timeoutMs?: number
        onOutlineReady?: (outline: CentralOutline) => Promise<void> | void
        onBatchComplete?: (payload: BatchCompletePayload) => Promise<void> | void
}

type GenerateGameResponse = {
        title: string
        description?: string
        units: GeneratedUnit[]
}

type CentralOutline = {
        courseTitle: string
        description?: string
        unitBlueprint: Array<{
                unitIndex: number
                title: string
                keyPoints: string[]
        }>
}

type BatchCompletePayload = {
        batchIndex: number
        durationMs: number
        unitIndices: number[]
        units: GenerateGameResponse["units"]
        attempts: number
}

type GenerationMetrics = {
        outlineDurationMs: number
        batchDurations: number[]
        totalDurationMs: number
        retries: number
}

type GenerateGameContentResult = {
        content: GenerateGameResponse
        outline: CentralOutline
        metrics: GenerationMetrics
}

function buildTextContent(resources: Resource[]): string {
        return resources
                .map((r) => {
                        if (r.resourceType === "text" && r.resourceContent) {
                                return r.resourceContent
                        }
                        return null
                })
                .filter(Boolean)
                .join("\n\n")
}

async function generateCentralOutline(options: {
        textContent: string
        imageUrls: string[]
        unitCount: number
        aiModel: string
}): Promise<CentralOutline> {
        const { textContent, imageUrls, unitCount, aiModel } = options

        const outlinePrompt = `You are an educational course planner. Build a shared outline for a course with ${unitCount} units using the preprocessed resources below.\n\nResources:\n${textContent}${
                imageUrls.length > 0
                        ? "\nImages are available as context. Note: use them only conceptually; do not return URLs."
                        : ""
        }\n\nOutput strict JSON with this shape:\n{\n  "courseTitle": "Concise descriptive title without words like Unit/Course or counts",\n  "description": "Optional summary",\n  "unitBlueprint": [\n    {"unitIndex": 1, "title": "Descriptive unit title without numbering prefix", "keyPoints": ["concept", "concept"]}\n  ]\n}\n\nRules:\n- Generate exactly ${unitCount} unitBlueprint entries with ascending unitIndex starting at 1.\n- Do NOT include labels such as "Unit 1:" or "Course" in any title.\n- Keep keyPoints concise and actionable.\n- Do not generate games yet; only the outline.`

        const messages = [
                { role: "system" as const, content: SAFETY_SYSTEM_PROMPT },
                imageUrls.length > 0
                        ? {
                                      role: "user" as const,
                                      content: [
                                              { type: "text" as const, text: outlinePrompt },
                                              ...imageUrls.map((url) => ({
                                                      type: "image_url" as const,
                                                      image_url: { url },
                                              })),
                                      ],
                          }
                        : { role: "user" as const, content: outlinePrompt },
        ]

        const completion = await openai.chat.completions.create({
                model: aiModel,
                messages,
                response_format: { type: "json_object" },
        })

        const responseContent =
                completion.choices[AI_CONSTANTS.RESPONSE_INDEX.FIRST_CHOICE]?.message?.content

        if (!responseContent) {
                throw new Error("No outline response from AI")
        }

        const parsed = JSON.parse(responseContent) as CentralOutline

        return parsed
}

async function generateUnitBatch(options: {
        aiModel: string
        outline: CentralOutline
        gamesPerUnit: number
        totalUnits: number
        unitIndices: number[]
}): Promise<GenerateGameResponse> {
        const { aiModel, outline, gamesPerUnit, totalUnits, unitIndices } = options

        const blueprintDetails = outline.unitBlueprint
                .filter((unit) => unitIndices.includes(unit.unitIndex))
                .map(
                        (unit) =>
                                `Unit ${unit.unitIndex}: ${unit.title} (key points: ${unit.keyPoints.join(", ")})`,
                )
                .join("\n")

        const prompt = `Use the central outline to create games for the requested units only.\n\nCentral outline:\nTitle: ${outline.courseTitle}\nDescription: ${outline.description ?? ""}\nBlueprint:\n${blueprintDetails}\n\nYou are generating part of a ${totalUnits}-unit course. Generate games for units [${unitIndices.join(", ")}], keeping them in ascending order. Each unit must contain ${gamesPerUnit} games.\n\nFollow these rules strictly:\n- Course title must remain: ${outline.courseTitle} (no prefixes like Course/Unit or counts).\n- Unit titles must NOT include numbering prefixes (no "Unit 1:").\n- Game titles must NOT start with the game type.\n- Include a mix of game types: quiz, matching, fill_blank, multiple_choice.\n- Difficulty levels: easy, medium, hard.\n\nIMPORTANT: Each game type MUST follow its exact schema below:\n\n1. MULTIPLE_CHOICE:\n{\n  "title": "Descriptive question title (NO 'Multiple Choice:' prefix)",\n  "gameType": "multiple_choice",\n  "difficultyLevel": "easy|medium|hard",\n  "content": {\n    "question": "The question text",\n    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],\n    "correctAnswer": 0\n  }\n}\n\n2. QUIZ (short answer):\n{\n  "title": "Descriptive question title (NO 'Quiz:' prefix)",\n  "gameType": "quiz",\n  "difficultyLevel": "easy|medium|hard",\n  "content": {\n    "question": "The question text",\n    "correctAnswer": "The exact answer"\n  }\n}\n\n3. FILL_BLANK:\n{\n  "title": "Descriptive exercise title (NO 'Fill in:' prefix)",\n  "gameType": "fill_blank",\n  "difficultyLevel": "easy|medium|hard",\n  "content": {\n    "text": "The quick ___ jumps over the lazy ___",\n    "blanks": [\n      {"answer": "brown fox"},\n      {"answer": "dog"}\n    ]\n  }\n}\n\n4. MATCHING:\n{\n  "title": "Descriptive matching title (NO 'Matching:' prefix)",\n  "gameType": "matching",\n  "difficultyLevel": "easy|medium|hard",\n  "content": {\n    "leftItems": ["Item 1", "Item 2", "Item 3"],\n    "rightItems": ["Match 1", "Match 2", "Match 3"],\n    "correctPairs": [\n      {"left": "Item 1", "right": "Match 1"},\n      {"left": "Item 2", "right": "Match 2"},\n      {"left": "Item 3", "right": "Match 3"}\n    ]\n  }\n}\n\nReturn JSON in this exact format:\n{\n  "title": "${outline.courseTitle}",\n  "description": "${outline.description ?? ""}",\n  "units": [\n    {\n      "title": "Unit title WITHOUT numbering prefix",\n      "games": [ /* ${gamesPerUnit} games following schemas */ ]\n    }\n  ]\n}\nOnly include units for indices [${unitIndices.join(", ")}], ordered to match the list. Ignore other units from the outline.`

        const completion = await openai.chat.completions.create({
                model: aiModel,
                messages: [
                        { role: "system", content: SAFETY_SYSTEM_PROMPT },
                        { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
        })

        const responseContent =
                completion.choices[AI_CONSTANTS.RESPONSE_INDEX.FIRST_CHOICE]?.message?.content

        if (!responseContent) {
                throw new Error("No response from AI")
        }

        const parsed = JSON.parse(responseContent) as GenerateGameResponse

        if (parsed.units.length !== unitIndices.length) {
                throw new Error("AI returned an unexpected number of units for the batch")
        }

        return parsed
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs?: number): Promise<T> {
        if (!timeoutMs) return promise

        let timeoutHandle: NodeJS.Timeout

        const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutHandle = setTimeout(
                        () => reject(new Error("Batch generation timed out")),
                        timeoutMs,
                )
        })

        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle))
}

export async function generateGameContent(
        params: GenerateGameParams,
): Promise<GenerateGameContentResult> {
        const {
                resources,
                aiModel = AI_CONSTANTS.DEFAULT_MODEL,
                unitCount,
                gamesPerUnit,
                batchSize = AI_CONSTANTS.BATCH_GENERATION.DEFAULT_BATCH_SIZE,
                parallelLimit = AI_CONSTANTS.BATCH_GENERATION.PARALLEL_LIMIT,
                maxRetries = AI_CONSTANTS.BATCH_GENERATION.MAX_RETRIES,
                timeoutMs = AI_CONSTANTS.BATCH_GENERATION.TIMEOUT_MS,
                onOutlineReady,
                onBatchComplete,
        } = params

        const textContent = buildTextContent(resources)

        const safetyCheck = validateContentSafety(textContent)
        if (!safetyCheck.safe) {
                throw new Error(
                        `Content safety check failed: ${safetyCheck.reason}. Please provide appropriate educational content.`,
                )
        }

        const imageUrls = resources
                .filter(
                        (r): r is Resource & { resourceFileUrl: string } =>
                                r.resourceType === "image" && Boolean(r.resourceFileUrl),
                )
                .map((r) => r.resourceFileUrl)

        const totalStart = performance.now()
        const outlineStart = performance.now()
        const outline = await generateCentralOutline({
                textContent,
                imageUrls,
                unitCount,
                aiModel,
        })
        const outlineDurationMs = performance.now() - outlineStart
        logger.info("Generated central outline for kurio", {
                duration: outlineDurationMs,
                unitCount,
                gamesPerUnit,
        })

        await onOutlineReady?.(outline)

        const batches = createUnitBatches(unitCount, batchSize)
        const batchDurations: number[] = []
        const batchResults: BatchedUnits[] = []
        let retryCounter = 0

        const iterator = batches.entries()
        const workerCount = Math.min(parallelLimit, batches.length)

        const runWorker = async (): Promise<void> => {
                for (;;) {
                        const next = iterator.next()
                        if (next.done) break
                        const [batchIndex, unitIndices] = next.value
                        let attempts = 0
                        // eslint-disable-next-line no-constant-condition
                        while (true) {
                                attempts++
                                const start = performance.now()
                                try {
                                        const resultPromise = generateUnitBatch({
                                                aiModel,
                                                outline,
                                                gamesPerUnit,
                                                totalUnits: unitCount,
                                                unitIndices,
                                        })
                                        const batchResponse = await withTimeout(resultPromise, timeoutMs)
                                        const durationMs = performance.now() - start
                                        batchDurations[batchIndex] = durationMs
                                        batchResults.push({
                                                unitIndices,
                                                units: batchResponse.units,
                                        })
                                        logger.logPerformance("batch_generation_ms", durationMs, {
                                                batchIndex,
                                                units: unitIndices.length,
                                        })
                                        await onBatchComplete?.({
                                                batchIndex,
                                                durationMs,
                                                unitIndices,
                                                units: batchResponse.units,
                                                attempts,
                                        })
                                        break
                                } catch (error) {
                                        retryCounter += 1
                                        if (attempts > maxRetries) {
                                                logger.error("Batch generation failed", error, {
                                                        batchIndex,
                                                        unitIndices,
                                                })
                                                throw error instanceof Error
                                                        ? error
                                                        : new Error("Failed to generate batch")
                                        }
                                        logger.warn("Retrying batch generation", {
                                                batchIndex,
                                                attempts,
                                                unitIndices,
                                                error: error instanceof Error ? error.message : String(error),
                                        })
                                }
                        }
                }
        }

        const workers: Array<Promise<void>> = []
        for (let i = 0; i < workerCount; i++) {
                workers.push(runWorker())
        }

        await Promise.all(workers)

        const mergedUnits = mergeUnitsFromBatches(batchResults, unitCount)
        const totalDurationMs = performance.now() - totalStart

        logger.info("Completed batched game generation", {
                totalDurationMs,
                outlineDurationMs,
                batchDurations,
                retryCounter,
        })

        return {
                content: {
                        title: outline.courseTitle,
                        description: outline.description,
                        units: mergedUnits,
                },
                outline,
                metrics: {
                        outlineDurationMs,
                        batchDurations,
                        totalDurationMs,
                        retries: retryCounter,
                },
        }
}

export { createUnitBatches, mergeUnitsFromBatches } from "./game-generator-helpers"
export type { BatchCompletePayload, CentralOutline, GenerateGameContentResult, GenerateGameResponse }

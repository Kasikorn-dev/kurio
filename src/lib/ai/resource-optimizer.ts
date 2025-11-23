import { AI_CONSTANTS } from "@/lib/constants"
import { openai } from "./openai-client"

export type Resource = {
        resourceType: "text" | "file" | "image"
        resourceContent?: string
        resourceFileUrl?: string
}

const MIN_BUDGET_PER_RESOURCE = 32

export type SummarizeFn = (params: {
        content: string
        targetLength: number
        model?: string
}) => Promise<string>

const summarizeWithOpenAI: SummarizeFn = async ({ content, targetLength, model }) => {
        const completion = await openai.chat.completions.create({
                model: model ?? AI_CONSTANTS.DEFAULT_MODEL,
                messages: [
                        {
                                role: "system",
                                content: "Summarize the provided content within the requested character budget while preserving key educational facts.",
                        },
                        {
                                role: "user",
                                content: `Summarize this to at most ${targetLength} characters. If summarization is not possible, truncate while keeping the core idea.\n\n${content}`,
                        },
                ],
        })

        const summary =
                completion.choices[AI_CONSTANTS.RESPONSE_INDEX.FIRST_CHOICE]?.message?.content?.trim() ?? ""

        return summary.slice(0, targetLength)
}

export async function optimizeResourcesForBudget(
        resources: Resource[],
        options?: {
                characterBudget?: number
                summarizer?: SummarizeFn
                model?: string
        },
): Promise<Resource[]> {
        const summarizer = options?.summarizer ?? summarizeWithOpenAI
        const characterBudget = options?.characterBudget ?? AI_CONSTANTS.INPUT_BUDGET.CHARACTER_BUDGET
        const textResources = resources.filter((r) => r.resourceType !== "image" && r.resourceContent)

        const totalLength = textResources.reduce((sum, r) => sum + (r.resourceContent?.length ?? 0), 0)

        if (characterBudget <= 0 || totalLength === 0 || totalLength <= characterBudget) {
                return resources
        }

        const processed: Resource[] = []
        let remainingBudget = characterBudget
        let remainingTextEntries = textResources.length

        for (const resource of resources) {
                if (resource.resourceType === "image" || !resource.resourceContent) {
                        processed.push(resource)
                        continue
                }

                const contentLength = resource.resourceContent.length
                const dynamicBudget = Math.max(
                        Math.floor(remainingBudget / remainingTextEntries),
                        Math.min(MIN_BUDGET_PER_RESOURCE, remainingBudget),
                )
                remainingTextEntries -= 1

                if (contentLength <= dynamicBudget) {
                        processed.push(resource)
                        remainingBudget -= contentLength
                        continue
                }

                try {
                        const summary = await summarizer({
                                content: resource.resourceContent,
                                targetLength: dynamicBudget,
                                model: options?.model,
                        })

                        processed.push({ ...resource, resourceContent: summary.slice(0, dynamicBudget) })
                        remainingBudget -= Math.min(summary.length, dynamicBudget)
                } catch (error) {
                        processed.push({
                                ...resource,
                                resourceContent: resource.resourceContent.slice(0, dynamicBudget),
                        })
                        remainingBudget -= dynamicBudget
                }
        }

        return processed
}

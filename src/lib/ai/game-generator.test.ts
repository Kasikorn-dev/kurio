import assert from "node:assert/strict"
import { mock, test } from "node:test"

process.env.SKIP_ENV_VALIDATION = "true"
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "http://localhost:3000/database"
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "test-openai-key"
process.env.SUPABASE_SERVICE_ROLE_KEY =
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? "test-supabase-service-role-key"
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:3000"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "test-supabase-anon-key"

const { optimizeResourcesForBudget } = await import("./resource-optimizer")
const { generateGameContent } = await import("./game-generator")
const { openai } = await import("./openai-client")

const completionResponse = {
        choices: [
                {
                        message: {
                                content: JSON.stringify({
                                        title: "Course",
                                        units: [],
                                }),
                        },
                },
        ],
}

const openAiCreateMock = mock.method(openai.chat.completions, "create", async () => completionResponse)

test("resources are summarized within budget while preserving order", async () => {
        const resources = [
                { resourceType: "text" as const, resourceContent: "A".repeat(80) },
                { resourceType: "file" as const, resourceContent: "B".repeat(90) },
                { resourceType: "image" as const, resourceFileUrl: "http://example.com/image.png" },
        ]

        const processed = await optimizeResourcesForBudget(resources, {
                characterBudget: 60,
                summarizer: async ({ content, targetLength }) => content.slice(0, targetLength),
        })

        const textContentLength = processed
                .filter((entry) => entry.resourceType !== "image")
                .map((entry) => entry.resourceContent ?? "")
                .join("")
                .length

        assert.equal(textContentLength <= 60, true)
        assert.deepEqual(
                processed.map((entry) => entry.resourceType),
                ["text", "file", "image"],
        )
})

test("generateGameContent builds prompt using budget-aware resources", async () => {
        const resources = [
                { resourceType: "text" as const, resourceContent: "A".repeat(400) },
                { resourceType: "file" as const, resourceContent: "B".repeat(400) },
        ]

        await generateGameContent({
                resources,
                unitCount: 1,
                gamesPerUnit: 1,
                aiModel: "test-model",
                characterBudget: 120,
        })

        const summarizationCall = openAiCreateMock.mock.calls.find((call) => {
                const content = call?.arguments?.[0]?.messages?.[1]?.content
                return typeof content === "string" && content.includes("Summarize this to at most")
        })?.arguments?.[0]

        assert.ok(summarizationCall)

        const finalCall = openAiCreateMock.mock.calls[openAiCreateMock.mock.calls.length - 1]?.arguments
        assert.ok(finalCall)
        const finalUserMessage = finalCall?.[0]?.messages?.find((message) => message.role === "user")
        assert.ok(finalUserMessage)

        const promptText = typeof finalUserMessage.content === "string" ? finalUserMessage.content : ""

        assert.equal(/A{150}/.test(promptText), false)
        assert.equal(/B{150}/.test(promptText), false)
})

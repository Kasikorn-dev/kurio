export const NOTIFICATION_MESSAGES = {
	AUTO_GEN: {
		TRIGGERED:
			"🎉 New content unlocked! We've generated 10 more units for you to explore.",
		GENERATING: "⏳ Generating new content based on your progress...",
		FAILED: "❌ Failed to generate new content. Please try again later.",
	},
	KURIO: {
		CREATING: "Creating your learning journey...",
		CREATED: "Kurio created successfully!",
		GENERATION_FAILED:
			"Failed to generate content. Please check your input and try again.",
		UNSAFE_CONTENT:
			"Content contains inappropriate material. Please provide educational content only.",
	},
	GAME: {
		SUBMITTED: "Answer submitted!",
		CORRECT: "✅ Correct!",
		INCORRECT: "❌ Incorrect. Try again!",
	},
} as const

const UNSAFE_KEYWORDS = [
	// Violence & Harm
	"weapon",
	"bomb",
	"kill",
	"murder",
	"suicide",
	"self-harm",
	"torture",
	"abuse",
	// Illegal Activities
	"drug",
	"cocaine",
	"heroin",
	"methamphetamine",
	"hack",
	"crack",
	"piracy",
	"steal",
	"fraud",
	// Adult Content
	"porn",
	"sex",
	"nude",
	"explicit",
	// Hate Speech
	"racist",
	"nazi",
	"hate",
	"discrimination",
]

export function validateContentSafety(content: string): {
	safe: boolean
	reason?: string
} {
	const lowerContent = content.toLowerCase()

	for (const keyword of UNSAFE_KEYWORDS) {
		if (lowerContent.includes(keyword)) {
			return {
				safe: false,
				reason: `Content contains potentially unsafe keyword: "${keyword}"`,
			}
		}
	}

	return { safe: true }
}

export const SAFETY_SYSTEM_PROMPT = `Create safe, educational content for all ages.

Rules:
- NO violence, weapons, illegal activities, adult themes
- NO harmful, discriminatory, or offensive content
- ONLY educational, positive learning experiences

If content is inappropriate, respond:
{"error": "inappropriate_content", "message": "Cannot create educational content from inappropriate material"}

Otherwise, create engaging educational games.`

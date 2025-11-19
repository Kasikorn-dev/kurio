import { GAME_CONSTANTS } from "@/lib/constants"

export type PasswordStrength = "weak" | "medium" | "strong"

export interface PasswordStrengthResult {
	strength: PasswordStrength
	score: number
	suggestions: string[]
}

export function calculatePasswordStrength(
	password: string,
): PasswordStrengthResult {
	const suggestions: string[] = []
	let score = 0

	// Length check
	if (password.length >= GAME_CONSTANTS.PASSWORD_STRENGTH.MIN_LENGTH) {
		score += 1
	} else {
		suggestions.push(
			`Add at least ${GAME_CONSTANTS.PASSWORD_STRENGTH.MIN_LENGTH} characters`,
		)
	}

	// Length bonus
	if (password.length >= GAME_CONSTANTS.PASSWORD_STRENGTH.STRONG_LENGTH) {
		score += 1
	}

	// Mixed case check (both uppercase and lowercase)
	const hasUppercase = /[A-Z]/.test(password)
	const hasLowercase = /[a-z]/.test(password)
	if (hasUppercase && hasLowercase) {
		score += 1
	} else {
		if (!hasUppercase) {
			suggestions.push("Add uppercase letters")
		}
		if (!hasLowercase) {
			suggestions.push("Add lowercase letters")
		}
	}

	// Number check
	if (/\d/.test(password)) {
		score += 1
	} else {
		suggestions.push("Add numbers")
	}

	// Special character check (optional)
	if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
		score += 1
	}

	// Determine strength
	let strength: PasswordStrength
	if (score <= 2) {
		strength = "weak"
	} else if (score <= 3) {
		strength = "medium"
	} else {
		strength = "strong"
	}

	return {
		strength,
		score,
		suggestions: suggestions.slice(
			0,
			GAME_CONSTANTS.PASSWORD_STRENGTH.MAX_SUGGESTIONS,
		),
	}
}

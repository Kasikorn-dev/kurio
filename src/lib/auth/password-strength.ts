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

	// Length check (minimum 8 characters)
	if (password.length >= 8) {
		score += 1
	} else {
		suggestions.push("Add at least 8 characters")
	}

	// Length bonus (12+ characters)
	if (password.length >= 12) {
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

	// Determine strength (max score is now 5, but we'll use 4 as threshold)
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
		suggestions: suggestions.slice(0, 2), // Limit to 2 suggestions
	}
}

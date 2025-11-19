/**
 * Application-wide constants
 * Centralized location for all magic numbers and configuration values
 */

// UI Constants
export const UI_CONSTANTS = {
	// Mobile breakpoint (matches Tailwind's md breakpoint)
	MOBILE_BREAKPOINT: 768,

	// Skeleton loading counts
	SKELETON_COUNT: {
		KURIO_CARD: 3,
	},

	// Character limits
	CHAR_LIMITS: {
		KURIO_TITLE: 100,
		KURIO_DESCRIPTION: 500,
	},

	// Grid columns
	GRID_COLUMNS: {
		MOBILE: 1,
		TABLET: 2,
		DESKTOP: 3,
	},
} as const

// Game Constants
export const GAME_CONSTANTS = {
	// Scoring
	BASE_SCORES: {
		EASY: 5,
		MEDIUM: 10,
		HARD: 15,
	},

	// Time bonus (in seconds)
	TIME_BONUS: {
		THRESHOLD: 30, // Bonus if answered under 30 seconds
		AMOUNT: 5,
	},

	// Unit count options
	UNIT_COUNT_OPTIONS: [5, 10, 20, 30] as const,

	// Password strength
	PASSWORD_STRENGTH: {
		MIN_LENGTH: 8,
		STRONG_LENGTH: 12,
		MAX_SUGGESTIONS: 2,
	},
} as const

// AI Constants
export const AI_CONSTANTS = {
	// Default AI model
	DEFAULT_MODEL: "gpt-5-nano-2025-08-07",

	// AI response indices
	RESPONSE_INDEX: {
		FIRST_CHOICE: 0,
	},
} as const

// Timing Constants
export const TIMING_CONSTANTS = {
	// Milliseconds to seconds conversion
	MS_TO_SECONDS: 1000,

	// Game completion delay (for showing result before navigation)
	GAME_COMPLETION_DELAY: 2000,

	// Password reset timeout
	PASSWORD_RESET_TIMEOUT: 1000,
} as const

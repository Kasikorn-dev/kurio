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

	// Unit count options (when auto-gen disabled)
	UNIT_COUNT_OPTIONS: [5, 10, 20] as const,

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
	// DEFAULT_MODEL: "gpt-5-mini-2025-08-07",

	// AI Generation Settings
	GENERATION: {
		TEMPERATURE: 0.3, // Lower = more deterministic (0 = deterministic, 1 = creative)
		// Note: seed parameter not available in all OpenAI models
	},

	// Auto-generation settings
	AUTO_GEN: {
		INITIAL_UNITS: 10, // Units to generate when auto-gen is enabled (default)
		ADDITIONAL_UNITS: 10, // Units to add when progress reaches threshold
		TRIGGER_THRESHOLD: 80, // Percentage of completion to trigger additional generation
	},

	// Progressive generation settings
	PROGRESSIVE_GEN: {
		INITIAL_GENERATION_UNITS: 3, // Units to generate initially (~10 seconds)
	},

	// Games per unit (fixed)
	GAMES_PER_UNIT: 10,

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

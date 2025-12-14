/**
 * Application-wide constants
 * Centralized location for all magic numbers and configuration values
 */

export const UI_CONSTANTS = {
	MOBILE_BREAKPOINT: 768,

	SKELETON_COUNT: {
		KURIO_CARD: 3,
	},
} as const

export const UNIT_CONSTANTS = {
	UNIT_COUNT_OPTIONS: [5, 10, 20] as const,

	INITIAL_UNITS: 10,
} as const

export const PASSWORD_STRENGTH = {
	MIN_LENGTH: 8,
	STRONG_LENGTH: 12,
	MAX_SUGGESTIONS: 2,
} as const

export const AI_CONSTANTS = {
	GAMES_PER_UNIT: 10,
} as const

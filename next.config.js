/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js"

/** @type {import("next").NextConfig} */
const config = {
	// Exclude supabase functions from build
	webpack: (config) => {
		config.watchOptions = {
			...config.watchOptions,
			ignored: ["**/supabase/**"],
		}
		return config
	},
	// Exclude supabase from TypeScript checking during build
	typescript: {
		ignoreBuildErrors: false,
	},
}

export default config

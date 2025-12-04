import { serve as serveDenoland } from "https://deno.land/std@0.168.0/http/server.ts"

/**
 * Handler type for Supabase Edge Functions
 * Matches the signature expected by Deno's serve function
 */
type Handler = (req: Request) => Response | Promise<Response>

export const serve = (handler: Handler) => {
	return serveDenoland(handler)
}

export const log = (message: string, context?: unknown) => {
	console.log(JSON.stringify({ message, context }, null, 2))
}

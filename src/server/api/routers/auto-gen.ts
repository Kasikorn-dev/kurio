import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { checkAndGenerateUnits } from "./auto-gen-helpers"

export const autoGenRouter = createTRPCRouter({
	checkAndGenerate: protectedProcedure
		.input(z.object({ kurioId: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			return checkAndGenerateUnits(ctx.db, input.kurioId, ctx.user.id)
		}),
})

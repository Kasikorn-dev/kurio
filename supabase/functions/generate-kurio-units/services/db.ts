import { createDatabaseConnection } from "../../utils/db.ts"

const sql = createDatabaseConnection()
/**
 * Update kurio progress in database
 * This allows clients to poll for progress instead of relying on Realtime
 */
export async function updateKurioProgress(params: {
	kurioId: string
	step: string
	progress: number
	unitsCompleted?: number
}) {
	await sql`
    UPDATE kurio 
    SET 
      generation_step = ${params.step},
      generation_progress = ${params.progress},
      units_completed = COALESCE(${params.unitsCompleted ?? null}, units_completed),
      updated_at = NOW()
    WHERE id = ${params.kurioId}
  `
}

// ===================================================================
// Kurio Queries (PHASE 1)
// ===================================================================

/**
 * Update Kurio with AI-generated title and description (PHASE 1)
 */
export async function updateKurioWithTitleAndDescription(params: {
	kurioId: string
	title: string
	description: string
}) {
	await sql`
    UPDATE kurio 
    SET 
      title = ${params.title},
      description = ${params.description},
      status = 'generating_units'::kurio_status,
      generation_step = 'kurio',
      generation_progress = 5,
      updated_at = NOW()
    WHERE id = ${params.kurioId}
  `
}

// ===================================================================
// Unit Queries (PHASE 2)
// ===================================================================

/**
 * Insert multiple units in a single batch operation (PHASE 2)
 * Returns inserted units with id, title, description, and order_index
 */
export async function insertUnits(params: {
	kurioId: string
	titles: string[]
	descriptions: string[]
}) {
	return await sql`
    INSERT INTO unit (kurio_id, title, description, order_index, status, created_at)
    SELECT * FROM UNNEST(
      ${sql.array(params.titles.map(() => params.kurioId))}::uuid[],
      ${sql.array(params.titles)}::varchar[],
      ${sql.array(params.descriptions)}::text[],
      ${sql.array(params.titles.map((_, i) => i))}::integer[],
      ${sql.array(params.titles.map(() => "generating"))}::unit_status[],
      ${sql.array(params.titles.map(() => new Date()))}::timestamptz[]
    )
    RETURNING id, title, description, order_index
  `
}

/**
 * Update Kurio after units are created (PHASE 2)
 * Sets progress to 30%, updates unit count, and marks status as generating_games
 */
export async function updateKurioAfterUnitsCreated(params: {
	kurioId: string
	unitCount: number
}) {
	await sql`
    UPDATE kurio 
    SET 
      generation_step = 'units',
      generation_progress = 30,
      unit_count = ${params.unitCount},
      status = 'generating_games'::kurio_status,
      updated_at = NOW()
    WHERE id = ${params.kurioId}
  `
}

/**
 * Mark Kurio as ready (temporary for testing when PHASE 3 is disabled)
 */
export async function markKurioAsReady(params: { kurioId: string }) {
	await sql`
    UPDATE kurio 
    SET 
      status = 'ready'::kurio_status,
      generation_step = 'units',
      generation_progress = 30,
      updated_at = NOW()
    WHERE id = ${params.kurioId}
  `
}

// ===================================================================
// Game Queries (PHASE 3)
// ===================================================================

/**
 * Insert a single game into the database (PHASE 3)
 * @deprecated Use insertGamesBatch for better performance
 */
export async function insertGame(params: {
	unitId: string
	title: string
	gameType: string
	difficultyLevel: string
	content: Record<string, unknown>
	orderIndex: number
}) {
	await sql`
    INSERT INTO game (unit_id, title, game_type, difficulty_level, content, order_index, created_at)
    VALUES (
      ${params.unitId},
      ${params.title},
      ${params.gameType}::game_type,
      ${params.difficultyLevel}::game_difficulty_level,
      ${JSON.stringify(params.content)}::jsonb,
      ${params.orderIndex},
      NOW()
    )
  `
}

/**
 * Insert multiple games in a single batch operation (PHASE 3)
 * Much faster than inserting games one by one
 */
export async function insertGamesBatch(
	games: Array<{
		unitId: string
		title: string
		gameType: string
		difficultyLevel: string
		content: Record<string, unknown>
		orderIndex: number
	}>,
) {
	if (games.length === 0) return

	await sql`
    INSERT INTO game (unit_id, title, game_type, difficulty_level, content, order_index, created_at)
    SELECT * FROM UNNEST(
      ${sql.array(games.map((g) => g.unitId))}::uuid[],
      ${sql.array(games.map((g) => g.title))}::varchar[],
      ${sql.array(games.map((g) => g.gameType))}::game_type[],
      ${sql.array(games.map((g) => g.difficultyLevel))}::game_difficulty_level[],
      ${sql.array(games.map((g) => JSON.stringify(g.content)))}::jsonb[],
      ${sql.array(games.map((g) => g.orderIndex))}::integer[],
      ${sql.array(games.map(() => new Date()))}::timestamptz[]
    )
  `
}

/**
 * Update unit status (PHASE 3)
 */
export async function updateUnitStatus(params: {
	unitId: string
	status: "ready" | "error"
}) {
	await sql`
    UPDATE unit 
    SET status = ${params.status}::unit_status 
    WHERE id = ${params.unitId}
  `
}

/**
 * Batch update multiple unit statuses (PHASE 3)
 * Much faster than updating one by one
 */
export async function updateUnitStatusesBatch(
	unitIds: string[],
	status: "ready" | "error",
) {
	if (unitIds.length === 0) return

	await sql`
    UPDATE unit 
    SET status = ${status}::unit_status 
    WHERE id = ANY(${sql.array(unitIds)}::uuid[])
  `
}

/**
 * Mark Kurio as complete after all games are generated (PHASE 3)
 * Also updates progress and units completed in a single query
 */
export async function markKurioAsComplete(params: {
	kurioId: string
	totalGames: number
	unitsCompleted?: number
}) {
	await sql`
    UPDATE kurio 
    SET 
      status = 'ready'::kurio_status,
      total_games = ${params.totalGames},
      generation_step = 'complete',
      generation_progress = 100,
      units_completed = COALESCE(${params.unitsCompleted ?? null}, units_completed),
      updated_at = NOW()
    WHERE id = ${params.kurioId}
  `
}

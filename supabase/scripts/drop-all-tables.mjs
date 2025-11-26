#!/usr/bin/env node

/**
 * Script to drop all tables from the database
 * Usage: node supabase/scripts/drop-all-tables.mjs
 * WARNING: This will delete all data!
 */

import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { config } from "dotenv"
import postgres from "postgres"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, "..", "..")

// Load environment variables from .env
config({ path: join(rootDir, ".env") })

// Get SUPABASE_DB_URL from environment
const databaseUrl = process.env.SUPABASE_DB_URL

if (!databaseUrl) {
	console.error("❌ SUPABASE_DB_URL is not set in environment variables")
	console.error("Please set SUPABASE_DB_URL in .env file")
	process.exit(1)
}

async function dropAllTables() {
	console.log("⚠️  WARNING: This will delete ALL tables and data!")
	console.log("Press Ctrl+C to cancel, or wait 3 seconds to continue...\n")

	// Wait 3 seconds
	await new Promise((resolve) => setTimeout(resolve, 3000))

	console.log("🗑️  Starting to drop all tables...\n")

	const sql = postgres(databaseUrl, {
		prepare: false,
	})

	try {
		// Get all table names
		const tables = await sql`
			SELECT tablename 
			FROM pg_tables 
			WHERE schemaname = 'public'
			ORDER BY tablename;
		`

		if (tables.length === 0) {
			console.log("ℹ️  No tables found in the database")
			await sql.end()
			return
		}

		console.log(`Found ${tables.length} table(s):`)
		tables.forEach((table, index) => {
			console.log(`  ${index + 1}. ${table.tablename}`)
		})
		console.log()

		// Disable foreign key checks temporarily
		await sql.unsafe("SET session_replication_role = 'replica';")

		// Drop all tables with CASCADE
		const droppedTables = []
		const failedTables = []

		for (const table of tables) {
			const tableName = table.tablename
			try {
				console.log(`  🗑️  Dropping table: ${tableName}...`)
				await sql.unsafe(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`)
				droppedTables.push(tableName)
				console.log(`  ✅ Dropped: ${tableName}`)
			} catch (error) {
				failedTables.push({ table: tableName, error: error.message })
				console.error(`  ❌ Failed to drop ${tableName}: ${error.message}`)
			}
		}

		// Re-enable foreign key checks
		await sql.unsafe("SET session_replication_role = 'origin';")

		await sql.end()

		// Summary
		console.log(`\n${"=".repeat(50)}`)
		console.log("📊 Drop Tables Summary:")
		console.log("=".repeat(50))
		console.log(`✅ Successfully dropped: ${droppedTables.length} table(s)`)

		if (droppedTables.length > 0) {
			droppedTables.forEach((table, index) => {
				console.log(`   ${index + 1}. ✅ ${table}`)
			})
		}

		if (failedTables.length > 0) {
			console.log(`\n❌ Failed: ${failedTables.length} table(s)`)
			failedTables.forEach(({ table, error }, index) => {
				console.log(`   ${index + 1}. ❌ ${table}`)
				console.log(`      Error: ${error}`)
			})
			console.log(`\n${"=".repeat(50)}`)
			process.exit(1)
		}

		console.log("=".repeat(50))
		console.log("\n✅ All tables dropped successfully!")
	} catch (error) {
		await sql.end()
		console.error("\n❌ Failed to drop tables:", error.message)
		process.exit(1)
	}
}

dropAllTables()

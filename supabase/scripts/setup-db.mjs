#!/usr/bin/env node

/**
 * Script to setup database: push schema and run SQL migrations
 * Usage: node supabase/scripts/setup-db.mjs
 */

import { execSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
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

async function setupDatabase() {
	console.log("🚀 Starting database setup...\n")

	// Step 1: Push schema with Drizzle
	console.log("📦 Step 1: Pushing schema with Drizzle Kit...")
	try {
		execSync("pnpm db:push", {
			stdio: "inherit",
			cwd: rootDir,
			env: { ...process.env, SUPABASE_DB_URL: databaseUrl },
		})
		console.log("✅ Schema pushed successfully\n")
	} catch (error) {
		console.error("❌ Failed to push schema:", error.message)
		process.exit(1)
	}

	// Step 2: Run SQL migrations
	console.log("🔧 Step 2: Running SQL migrations...")

	const migrationsDir = join(rootDir, "supabase/migrations")

	// Get all .sql files and sort them alphabetically
	const sqlFiles = readdirSync(migrationsDir)
		.filter((file) => file.endsWith(".sql"))
		.sort()

	if (sqlFiles.length === 0) {
		console.log("  ⚠️  No SQL migration files found")
		return
	}

	console.log(`  Found ${sqlFiles.length} migration file(s)\n`)

	const sql = postgres(databaseUrl, {
		prepare: false,
	})

	const executedFiles = []
	const failedFiles = []

	try {
		for (let i = 0; i < sqlFiles.length; i++) {
			const file = sqlFiles[i]
			const fileNumber = i + 1
			const totalFiles = sqlFiles.length

			console.log(`\n  [${fileNumber}/${totalFiles}] 📄 Processing: ${file}`)
			console.log(`  ⏳ Running ${file}...`)

			try {
				const sqlContent = readFileSync(join(migrationsDir, file), "utf-8")
				await sql.unsafe(sqlContent)
				executedFiles.push(file)
				console.log(`  ✅ ${file} executed successfully`)
			} catch (fileError) {
				failedFiles.push({ file, error: fileError.message })
				console.error(`  ❌ ${file} failed: ${fileError.message}`)
				throw fileError // Stop execution on first error
			}
		}

		await sql.end()

		// Summary
		console.log(`\n${"=".repeat(50)}`)
		console.log("📊 Migration Summary:")
		console.log("=".repeat(50))
		console.log(`✅ Successfully executed: ${executedFiles.length} file(s)`)

		if (executedFiles.length > 0) {
			executedFiles.forEach((file, index) => {
				console.log(`   ${index + 1}. ✅ ${file}`)
			})
		}

		if (failedFiles.length > 0) {
			console.log(`\n❌ Failed: ${failedFiles.length} file(s)`)
			failedFiles.forEach(({ file, error }, index) => {
				console.log(`   ${index + 1}. ❌ ${file}`)
				console.log(`      Error: ${error}`)
			})
			console.log(`\n${"=".repeat(50)}`)
			process.exit(1)
		}

		console.log("=".repeat(50))
		console.log("\n✅ Database setup completed successfully!")
	} catch {
		await sql.end()

		// Show summary even on error
		if (executedFiles.length > 0 || failedFiles.length > 0) {
			console.log(`\n${"=".repeat(50)}`)
			console.log("📊 Migration Summary:")
			console.log("=".repeat(50))

			if (executedFiles.length > 0) {
				console.log(`✅ Successfully executed: ${executedFiles.length} file(s)`)
				executedFiles.forEach((file, index) => {
					console.log(`   ${index + 1}. ✅ ${file}`)
				})
			}

			if (failedFiles.length > 0) {
				console.log(`\n❌ Failed: ${failedFiles.length} file(s)`)
				failedFiles.forEach(({ file, error }, index) => {
					console.log(`   ${index + 1}. ❌ ${file}`)
					console.log(`      Error: ${error}`)
				})
			}
			console.log("=".repeat(50))
		}

		console.error("\n❌ Database setup failed!")
		process.exit(1)
	}
}

setupDatabase()

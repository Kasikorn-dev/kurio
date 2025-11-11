import Link from "next/link"
import { HydrateClient } from "@/trpc/server"

export default async function Home() {
	return (
		<HydrateClient>
			<div className="flex flex-1 flex-col items-center justify-center bg-background">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="font-extrabold text-5xl text-foreground tracking-tight sm:text-[5rem]">
						Kurio <span className="text-primary">Game</span> Platform
					</h1>
					<p className="max-w-2xl text-center text-muted-foreground text-xl">
						Create engaging educational games powered by AI. Transform your
						content into interactive learning experiences.
					</p>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
							href="/kurios"
						>
							<h3 className="font-bold text-2xl">My Kurios →</h3>
							<div className="text-lg">
								View and manage your game collections
							</div>
						</Link>
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
							href="/kurios/create"
						>
							<h3 className="font-bold text-2xl">Create Kurio →</h3>
							<div className="text-lg">
								Create a new game with AI-powered content generation
							</div>
						</Link>
					</div>
				</div>
			</div>
		</HydrateClient>
	)
}

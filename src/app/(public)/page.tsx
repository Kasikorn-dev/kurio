import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HydrateClient } from "@/trpc/server"

export default async function Home() {
	return (
		<HydrateClient>
			<div className="flex flex-1 flex-col items-center justify-center bg-background">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 sm:gap-16">
					{/* Hero Section */}
					<div className="flex flex-col items-center gap-4 text-center sm:gap-6">
						<h1 className="font-extrabold text-3xl text-foreground tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
							Create Educational Games
							<br />
							<span className="text-primary">with AI</span>
						</h1>
						<p className="max-w-2xl text-center text-base text-muted-foreground sm:text-lg md:text-xl">
							Transform your content into interactive learning experiences
							powered by AI
						</p>
						<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
							<Button asChild size="lg" className="w-full sm:w-auto">
								<Link href="/signup">Get Started Free</Link>
							</Button>
							<Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
								<Link href="/login">Sign In</Link>
							</Button>
						</div>
					</div>

					{/* Features Section */}
					<div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
						<div className="flex flex-col gap-3 rounded-lg border bg-card p-6">
							<div className="text-3xl text-primary">🤖</div>
							<h3 className="font-bold text-xl">AI-Powered</h3>
							<p className="text-muted-foreground text-sm">
								Use AI to automatically generate game content from your
								materials
							</p>
						</div>
						<div className="flex flex-col gap-3 rounded-lg border bg-card p-6">
							<div className="text-3xl text-primary">🎮</div>
							<h3 className="font-bold text-xl">Interactive Games</h3>
							<p className="text-muted-foreground text-sm">
								Create various game types like Quiz, Matching, Fill in the blank
							</p>
						</div>
						<div className="flex flex-col gap-3 rounded-lg border bg-card p-6">
							<div className="text-3xl text-primary">📊</div>
							<h3 className="font-bold text-xl">Track Progress</h3>
							<p className="text-muted-foreground text-sm">
								Monitor player progress and learning outcomes
							</p>
						</div>
					</div>

					{/* CTA Section */}
					<div className="flex flex-col items-center gap-4 text-center">
						<h2 className="font-bold text-2xl sm:text-3xl">Ready to create games?</h2>
						<div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
							<Link
								className="flex w-full flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md sm:max-w-xs"
								href="/kurio"
							>
								<h3 className="font-bold text-xl sm:text-2xl">My Kurios →</h3>
								<div className="text-base sm:text-lg">
									View and manage your game collections
								</div>
							</Link>
							<Link
								className="flex w-full flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md sm:max-w-xs"
								href="/create-kurio"
							>
								<h3 className="font-bold text-xl sm:text-2xl">Create Kurio →</h3>
								<div className="text-base sm:text-lg">
									Create a new game with AI-powered content generation
								</div>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</HydrateClient>
	)
}

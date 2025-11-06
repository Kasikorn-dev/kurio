import Link from "next/link"

import { api, HydrateClient } from "@/trpc/server"

export default async function Home() {
	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
						Kurio <span className="text-[hsl(280,100%,70%)]">Game</span>{" "}
						Platform
					</h1>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
							href="/kurios"
						>
							<h3 className="font-bold text-2xl">My Kurios →</h3>
							<div className="text-lg">
								View and manage your game collections
							</div>
						</Link>
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
							href="/kurios/create"
						>
							<h3 className="font-bold text-2xl">Create Kurio →</h3>
							<div className="text-lg">
								Create a new game with AI-powered content generation
							</div>
						</Link>
					</div>
				</div>
			</main>
		</HydrateClient>
	)
}

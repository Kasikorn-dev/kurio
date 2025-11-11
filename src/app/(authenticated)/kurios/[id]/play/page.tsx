import { GamePlayer } from "@/components/custom/game/game-player"

type PlayPageProps = {
	params: Promise<{ id: string }>
}

export default async function PlayPage({ params }: PlayPageProps) {
	const { id } = await params

	return <GamePlayer kurioId={id} />
}

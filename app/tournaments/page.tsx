import ChessBackground from "@/components/ChessBackground"
import { TournamentsPageClient } from "@/components/tournaments/tournaments-page-client"
import { listTournaments } from "@/lib/db"
import { getUpcomingTournaments } from "@/lib/tournament-display"

export const revalidate = 60

export default async function TournamentsPage() {
  const tournaments = getUpcomingTournaments(await listTournaments())

  return (
    <ChessBackground badge="" title1="" title2="" description="">
      <TournamentsPageClient tournaments={tournaments} />
    </ChessBackground>
  )
}

import ChessBackground from "@/components/ChessBackground"
import { ClubPageClient } from "@/components/club/club-page-client"
import { listClubContent } from "@/lib/db"

export const revalidate = 60

export default async function ClubPage() {
  const content = await listClubContent({ publishedOnly: true })

  return (
    <ChessBackground>
      <ClubPageClient content={content} />
    </ChessBackground>
  )
}

import { NextRequest, NextResponse } from "next/server"
import { ImageResponse } from "next/og"
import React from "react"
import { getTournamentById, listTournamentParticipants } from "@/lib/db"
import { getSortedStandings, type PlayerStanding } from "@/lib/tiebreakers"
import { supabaseAdmin } from "@/lib/supabase"

const TB_LABELS: Record<string, string> = {
    head_to_head: 'Личн',
    buchholz: 'Бухг',
    buchholz_cut1: 'Бухг1',
    buchholz_cut2: 'Бухг2',
    median_buchholz: 'МедБ',
    sonneborn_berger: 'SB',
    number_of_wins: 'Побед',
    games_as_black: 'Чёрн',
    progressive: 'Кум',
    wins_with_black: 'ПобЧ',
}

const TB_FIELD: Record<string, keyof NonNullable<PlayerStanding['tiebreakers']>> = {
    head_to_head: 'headToHead',
    buchholz: 'buchholz',
    buchholz_cut1: 'buchholzCut1',
    buchholz_cut2: 'buchholzCut2',
    median_buchholz: 'medianBuchholz',
    sonneborn_berger: 'sonnebornBerger',
    number_of_wins: 'numberOfWins',
    games_as_black: 'gamesAsBlack',
    progressive: 'progressive',
    wins_with_black: 'winsWithBlack',
}

function buildRoundLabel(result: string, color: string, opponentRank: number | null): string {
    if (result === 'bye') return 'bye'
    const prefix = (result === 'win' || result === 'forfeit_win')
        ? '+' : (result === 'loss' || result === 'forfeit_loss') ? '-' : '='
    const colorChar = color === 'white' ? 'W' : color === 'black' ? 'B' : ''
    return `${prefix}${colorChar}${opponentRank ?? '?'}`
}

function labelColor(label: string): string {
    if (label.startsWith('+')) return '#4ade80'
    if (label.startsWith('-')) return '#f87171'
    if (label.startsWith('=')) return '#facc15'
    return '#94a3b8'
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params
        const tournamentId = Number(id)
        if (!Number.isFinite(tournamentId)) {
            return NextResponse.json({ error: "Некорректный ID" }, { status: 400 })
        }

        // Parse optional roundNumber from body
        let roundNumber: number | null = null
        try {
            const body = await req.json()
            if (body.roundNumber) roundNumber = Number(body.roundNumber)
        } catch { /* empty body is ok */ }

        const tournament = await getTournamentById(tournamentId)
        if (!tournament) {
            return NextResponse.json({ error: "Турнир не найден" }, { status: 404 })
        }

        const chatId = tournament.chat_id || (tournament.creator_telegram_id ? String(tournament.creator_telegram_id) : null)
        const token = String(process.env.TELEGRAM_BOT_TOKEN || '').trim()

        if (!chatId || !token) {
            return NextResponse.json({ error: "chat_id/creator_telegram_id и TELEGRAM_BOT_TOKEN не настроены" }, { status: 400 })
        }

        // Build standings data
        const sorted = await getSortedStandings(tournamentId)
        const rankMap = new Map<number, number>()
        sorted.forEach((s, idx) => rankMap.set(s.participantId, idx + 1))

        const participants = await listTournamentParticipants(tournamentId)
        const nickMap = new Map(participants.map(p => [p.id!, p.nickname]))

        const tiebreakerString = tournament.tiebreakers || 'buchholz,buchholz_cut1'
        const tiebreakerKeys = tiebreakerString.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        const totalRounds = sorted.reduce((max, s) => Math.max(max, s.roundNumbers.length), 0)

        const effectiveRound = roundNumber ?? totalRounds
        const isFinal = tournament.rounds > 0 && effectiveRound >= tournament.rounds

        // Build row data
        const rows = sorted.map((s, idx) => {
            const rounds: string[] = []
            for (let i = 0; i < totalRounds; i++) {
                if (i < s.results.length) {
                    const oppId = s.opponents[i]
                    const oppRank = (oppId && oppId !== 0) ? (rankMap.get(oppId) ?? null) : null
                    rounds.push(buildRoundLabel(s.results[i], s.colors[i], oppRank))
                } else {
                    rounds.push('')
                }
            }
            const tbVals: (number | string)[] = tiebreakerKeys.map(key => {
                const field = TB_FIELD[key]
                if (field) {
                    const v = s.tiebreakers[field]
                    return v !== undefined ? v : '-'
                }
                return '-'
            })
            return {
                rank: idx + 1,
                nick: (nickMap.get(s.participantId) || `#${s.participantId}`).slice(0, 20),
                pts: s.score,
                rounds,
                tbVals,
            }
        })

        // Calculate image dimensions
        const maxPlayers = Math.min(rows.length, 30)
        const displayRows = rows.slice(0, maxPlayers)
        const colWidths = {
            rank: 35,
            nick: 140,
            pts: 45,
            round: 55,
            tb: 50,
        }
        const imgWidth = colWidths.rank + colWidths.nick + colWidths.pts
            + totalRounds * colWidths.round
            + tiebreakerKeys.length * colWidths.tb
            + 48 // padding
        const rowHeight = 28
        const headerHeight = 70
        const imgHeight = headerHeight + (displayRows.length + 1) * rowHeight + 24

        const tbLabels = tiebreakerKeys.map(k => TB_LABELS[k] || k)

        // Build caption
        const caption = isFinal
            ? `🏆 ${tournament.title} — Итоги`
            : `♟ ${tournament.title} — После тура ${roundNumber ?? totalRounds}`

        // Generate image
        const headerCells: React.ReactElement[] = [
            React.createElement('div', { key: 'h-rank', style: { width: colWidths.rank, textAlign: 'center', flexShrink: 0 } }, '№'),
            React.createElement('div', { key: 'h-nick', style: { width: colWidths.nick, flexShrink: 0 } }, 'Участник'),
            React.createElement('div', { key: 'h-pts', style: { width: colWidths.pts, textAlign: 'center', flexShrink: 0 } }, 'Очки'),
        ]
        for (let r = 0; r < totalRounds; r++) {
            headerCells.push(
                React.createElement('div', { key: `h-r${r}`, style: { width: colWidths.round, textAlign: 'center', flexShrink: 0 } }, `Т${r + 1}`)
            )
        }
        for (let t = 0; t < tbLabels.length; t++) {
            headerCells.push(
                React.createElement('div', { key: `h-tb${t}`, style: { width: colWidths.tb, textAlign: 'center', flexShrink: 0 } }, tbLabels[t])
            )
        }

        const dataRows = displayRows.map((row, ri) => {
            const cells: React.ReactElement[] = [
                React.createElement('div', { key: `r${ri}-rank`, style: { width: colWidths.rank, textAlign: 'center', flexShrink: 0 } }, String(row.rank)),
                React.createElement('div', { key: `r${ri}-nick`, style: { width: colWidths.nick, flexShrink: 0, overflow: 'hidden' } }, row.nick),
                React.createElement('div', { key: `r${ri}-pts`, style: { width: colWidths.pts, textAlign: 'center', flexShrink: 0, fontWeight: 700 } }, String(row.pts)),
            ]
            for (let c = 0; c < row.rounds.length; c++) {
                const lbl = row.rounds[c]
                cells.push(
                    React.createElement('div', {
                        key: `r${ri}-rd${c}`,
                        style: { width: colWidths.round, textAlign: 'center', flexShrink: 0, color: labelColor(lbl), fontSize: 12 },
                    }, lbl)
                )
            }
            for (let t = 0; t < row.tbVals.length; t++) {
                cells.push(
                    React.createElement('div', {
                        key: `r${ri}-tb${t}`,
                        style: { width: colWidths.tb, textAlign: 'center', flexShrink: 0, color: '#94a3b8', fontSize: 12 },
                    }, String(row.tbVals[t]))
                )
            }
            return React.createElement('div', {
                key: `row-${ri}`,
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    height: rowHeight,
                    background: ri % 2 === 0 ? '#111827' : '#0d1525',
                    paddingLeft: 8,
                    paddingRight: 8,
                    fontSize: 13,
                },
            }, cells)
        })

        const img = new ImageResponse(
            React.createElement('div', {
                style: {
                    width: imgWidth,
                    height: imgHeight,
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#0b1220',
                    color: 'white',
                    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system',
                    padding: '16px 16px 8px 16px',
                },
            }, [
                React.createElement('div', {
                    key: 'title',
                    style: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
                }, tournament.title || 'Без названия'),
                React.createElement('div', {
                    key: 'sub',
                    style: { fontSize: 14, opacity: 0.7, marginBottom: 10 },
                }, isFinal ? '🏆 Итоги турнира' : `После тура ${roundNumber ?? totalRounds}`),
                // Header row
                React.createElement('div', {
                    key: 'header',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        height: rowHeight,
                        paddingLeft: 8,
                        paddingRight: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        opacity: 0.8,
                        borderBottom: '1px solid #1e293b',
                    },
                }, headerCells),
                // Data rows
                ...dataRows,
            ]),
            { width: imgWidth, height: imgHeight }
        )

        // Send to Telegram
        const ab = await img.arrayBuffer()
        const blob = new Blob([ab], { type: 'image/png' })
        const fd = new FormData()
        fd.append('chat_id', chatId)
        fd.append('photo', blob, 'standings.png')
        fd.append('caption', caption)

        const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: fd })
        if (!tgRes.ok) {
            const text = await tgRes.text()
            console.error('[send-standings] Telegram sendPhoto failed:', tgRes.status, text)
            return NextResponse.json({ error: `Telegram error: ${tgRes.status}`, details: text }, { status: 502 })
        }

        return NextResponse.json({ ok: true, final: isFinal })
    } catch (e) {
        console.error('[send-standings] Failed:', e)
        return NextResponse.json({ error: "Ошибка отправки" }, { status: 500 })
    }
}

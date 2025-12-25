import { spawn } from 'child_process'
import { promises as fs, existsSync } from 'fs'
import * as path from 'path'
import * as os from 'os'
import { getTournamentById, listTournamentParticipants, listRounds, listMatches, generateSwissPairings, type Tournament, type TournamentParticipant, type Round, type Match, type User } from './db'
import { supabase } from './supabase'

/**
 * BBP Pairings integration harness.
 *
 * This module prepares TRF(bx) content, runs the BBP Pairings engine
 * AUM-style CLI (legacy JaVaFo-compatible), parses its output,
 * and inserts pairings into the database.
 *
 * Requirements:
 * - Install BBP Pairings binary and set env BBP_PAIRINGS_BIN to its path (or ensure it's on PATH).
 * - Program interface: AUM-style CLI used by BBP Pairings (legacy JaVaFo-compatible): <bin> input.trfx -p outfile.txt -l checklist.txt
 *
 * Reference: BBP Pairings implements Dutch and Burstein systems and extends TRF(x) to TRF(bx) for non-standard point systems.
 */

export interface BbpRunResult {
  pairs: Array<{ whitePos: number; blackPos: number | null }>
  rawOut?: string
  rawChecklist?: string
}

let lastBbpReason: string | undefined
export function getLastBbpReason(): string | undefined {
  return lastBbpReason
}

function resolveBbpBinary(): { ok: boolean; bin?: string; reason?: string } {
  const envBin = process.env.BBP_PAIRINGS_BIN
  const candidates: string[] = []

  // If env is provided, resolve it relative to the current working directory when not absolute
  if (envBin && envBin.trim().length > 0) {
    const candidate = path.isAbsolute(envBin) ? envBin : path.resolve(process.cwd(), envBin)
    candidates.push(candidate)
  }

  // Auto-discovery for common OS/arch inside project tree
  try {
    const platform = process.platform
    const arch = process.arch
    const projectRoot = process.cwd()
    const bbpDir = path.join(projectRoot, 'bin', 'bbp')

    if (platform === 'darwin') {
      const name = arch === 'arm64' ? 'bbpPairings-macos-arm64' : 'bbpPairings-macos-amd64'
      candidates.push(path.join(bbpDir, name))
    } else if (platform === 'linux') {
      const name = arch === 'arm64' ? 'bbpPairings-linux-arm64' : arch === 'x64' ? 'bbpPairings-linux-amd64' : 'bbpPairings'
      candidates.push(path.join(bbpDir, name))
    } else if (platform === 'win32') {
      candidates.push(path.join(bbpDir, 'bbpPairings.exe'))
    }
  } catch {}

  // Fallback to PATH name
  candidates.push('bbpPairings')

  for (const c of candidates) {
    // Don't try to existsSync for a bare PATH command name; let spawn handle it
    if (c === 'bbpPairings') continue
    try {
      if (existsSync(c)) {
        return { ok: true, bin: c }
      }
    } catch {}
  }

  // If env was provided but not found as a file, still return it (spawn will error if invalid)
  if (envBin && envBin.trim().length > 0) {
    const candidate = path.isAbsolute(envBin) ? envBin : path.resolve(process.cwd(), envBin)
    if (!existsSync(candidate)) {
      return { ok: false, reason: `BBP_PAIRINGS_BIN not found: ${candidate}` }
    }
    return { ok: true, bin: candidate }
  }

  // Last resort: rely on PATH
  return { ok: true, bin: 'bbpPairings' }
}

async function ensureFileDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {}
}

function toOneDecimal(n: number | undefined | null): string {
  const v = Number(n ?? 0)
  return Number.isFinite(v) ? v.toFixed(1) : '0.0'
}

/**
 * Build TRF content tailored for BBP Pairings.
 *
 * Observed real BBP builds accept a minimal TRF like:
 *   012 <title>
 *   XXR <rounds>
 *   001 <id> <name> <rating>
 *
 * Avoid non-standard BB* lines and XXC which some builds reject (e.g., "Invalid line 'BBW 1.0'").
 */
async function buildBbpTrfx(
  tournament: Tournament,
  participants: Array<TournamentParticipant & { user: User }>,
  prevRounds: Round[],
  currentRoundNum: number,
): Promise<string> {
  const lines: string[] = []

  // Basic headers (keep minimal to maximize compatibility)
  const headerId = typeof tournament.id === 'number' ? String(tournament.id) : ''
  lines.push(`012 ${tournament.title}${headerId ? ' ' + headerId : ''}`)

  // Configure initial piece colors (required by some BBP builds)
  lines.push(`XXC white1`)

  // Expected total rounds
  const totalRounds = Number(tournament.rounds || 0)
  if (Number.isFinite(totalRounds) && totalRounds > 0) {
    lines.push(`XXR ${totalRounds}`)
  }

  // Helper for a minimal 001 line similar to bin/bbp/min.trfx
  function sanitizeName(s: string): string {
    return (s || '').replace(/\s+/g, ' ').trim()
  }
  function make001Line(id: number, name: string, rating?: number | null, score = 0): string {
    const idStr = String(id)
    const nameStr = sanitizeName(name).slice(0, 30)
    const padName = nameStr.padEnd(30, ' ')
    const ratingValRaw = (rating !== null && rating !== undefined) ? Number(rating) : 1500
    const ratingVal = Math.max(0, Math.min(9999, Math.round(ratingValRaw)))
    const ratingStr = String(ratingVal).padStart(4, ' ')
    const scoreStr = toOneDecimal(score).padStart(4, ' ')
    const gapBetweenRatingAndScore = 29 // mimic bin/bbp/min2.trfx
    // Pattern close to min2.trfx: 001 + 4 spaces + id + 6 spaces + name(30) + rating(4) + GAP(29) + score(4) + 4 spaces + starting rank(id)
    return `001    ${idStr}      ${padName}${ratingStr}${' '.repeat(gapBetweenRatingAndScore)}${scoreStr}    ${idStr}`
  }

  // Pre-compute scores from previous rounds (not printed in minimal 001 lines, but used later if we extend TRF)
  const prevIds = (prevRounds || [])
    .filter(r => (r.number || 0) < currentRoundNum)
    .map(r => r.id!)
  const pointsByParticipant = new Map<number, number>()
  for (const p of participants) pointsByParticipant.set(p.id!, 0)

  for (const rid of prevIds) {
    const matches = await listMatches(rid)
    for (const m of matches) {
      if (typeof m.white_participant_id === 'number') {
        pointsByParticipant.set(
          m.white_participant_id,
          (pointsByParticipant.get(m.white_participant_id) || 0) + (m.score_white || 0)
        )
      }
      if (typeof m.black_participant_id === 'number') {
        pointsByParticipant.set(
          m.black_participant_id,
          (pointsByParticipant.get(m.black_participant_id) || 0) + (m.score_black || 0)
        )
      }
    }
  }

  // Players: use position order as IDs, include nickname or user full name
  let pos = 1
  for (const p of participants) {
    const rating = p.user?.rating ?? null
    const name = p.nickname || `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim() || (p.user?.username || `Player${pos}`)
    const score = pointsByParticipant.get(p.id!) || 0
    lines.push(make001Line(pos, name, rating, score))
    pos += 1
  }

  return lines.join('\n') + '\n'
}

/**
 * Parse BBP pairing output using common patterns used by BBP Pairings (legacy JaVaFo-compatible).
 */
function parseBbpOutFile(outText: string): BbpRunResult {
  const pairs: Array<{ whitePos: number; blackPos: number | null }> = []

  const lines = outText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    let m: RegExpMatchArray | null = null
    // Board N: X - Y
    m = line.match(/^Board\s+(\d+)\s*:\s*(\d+)\s*-\s*(\d+)$/i)
    if (m) {
      const wp = Number(m[2])
      const bp = Number(m[3])
      if (Number.isFinite(wp) && Number.isFinite(bp)) {
        pairs.push({ whitePos: wp, blackPos: bp })
        continue
      }
    }
    // Board N: X - BYE
    m = line.match(/^Board\s+(\d+)\s*:\s*(\d+)\s*-\s*BYE$/i)
    if (m) {
      const wp = Number(m[2])
      if (Number.isFinite(wp)) {
        pairs.push({ whitePos: wp, blackPos: null })
        continue
      }
    }
    // Board N: BYE - X (treat as X vs BYE)
    m = line.match(/^Board\s+(\d+)\s*:\s*BYE\s*-\s*(\d+)$/i)
    if (m) {
      const wp = Number(m[2])
      if (Number.isFinite(wp)) {
        pairs.push({ whitePos: wp, blackPos: null })
        continue
      }
    }
    // X vs Y
    m = line.match(/^(\d+)\s+vs\s+(\d+)$/i)
    if (m) {
      const wp = Number(m[1])
      const bp = Number(m[2])
      if (Number.isFinite(wp) && Number.isFinite(bp)) {
        pairs.push({ whitePos: wp, blackPos: bp })
        continue
      }
    }
    // X vs BYE
    m = line.match(/^(\d+)\s+vs\s+BYE$/i)
    if (m) {
      const wp = Number(m[1])
      if (Number.isFinite(wp)) {
        pairs.push({ whitePos: wp, blackPos: null })
        continue
      }
    }
    // BYE vs X (treat as X vs BYE)
    m = line.match(/^BYE\s+vs\s+(\d+)$/i)
    if (m) {
      const wp = Number(m[1])
      if (Number.isFinite(wp)) {
        pairs.push({ whitePos: wp, blackPos: null })
        continue
      }
    }
    // X Y
    m = line.match(/^(\d+)\s+(\d+)$/)
    if (m) {
      const wp = Number(m[1])
      const bp = Number(m[2])
      if (Number.isFinite(wp) && Number.isFinite(bp)) {
        pairs.push({ whitePos: wp, blackPos: bp })
        continue
      }
    }
    // X BYE
    m = line.match(/^(\d+)\s+BYE$/i)
    if (m) {
      const wp = Number(m[1])
      if (Number.isFinite(wp)) {
        pairs.push({ whitePos: wp, blackPos: null })
        continue
      }
    }
  }

  return { pairs, rawOut: outText }
}

async function runBbpBinary(trfPath: string, outPath: string, listPath: string, binPath: string, systemFlag: '--dutch' | '--burstein', timeoutMs: number): Promise<{ outText: string; listText?: string }> {
  return new Promise((resolve, reject) => {
    const args = [systemFlag, trfPath, '-p', outPath, '-l', listPath]
    const child = spawn(binPath, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let killed = false
    const timer = setTimeout(() => {
      killed = true
      try { child.kill('SIGKILL') } catch {}
      reject(new Error(`Timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => { stdout += String(d) })
    child.stderr.on('data', (d) => { stderr += String(d) })

    child.on('error', (err) => {
      const wd = path.dirname(trfPath)
      clearTimeout(timer)
      reject(new Error(`Failed to start bbpPairings process: ${err.message}\nworkDir=${wd}\ntrfPath=${trfPath}`))
    })

    child.on('close', async (code) => {
      clearTimeout(timer)
      try {
        const outText = await fs.readFile(outPath, 'utf-8').catch(() => '')
        const listText = await fs.readFile(listPath, 'utf-8').catch(() => undefined)
        if (killed) return
        if (code !== 0) {
          const wd = path.dirname(trfPath)
          const sTop = stdout.slice(0, 500)
          const eTop = stderr.slice(0, 500)
          const msg = `bbpPairings exited with code ${code}.\nworkDir=${wd}\ntrfPath=${trfPath}\noutPath=${outPath}\nlistPath=${listPath}\nstderr(top500):\n${eTop}\nstdout(top500):\n${sTop}`
          reject(new Error(msg + `\noutFileReadable=${outText.length > 0}`))
          return
        }
        resolve({ outText, listText })
      } catch (readErr: unknown) {
        const message = readErr instanceof Error ? readErr.message : String(readErr)
        const wd = path.dirname(trfPath)
        reject(new Error(`bbpPairings finished but reading output failed: ${message}\nworkDir=${wd}\ntrfPath=${trfPath}`))
      }
    })
  })
}

/**
 * Attempt to generate pairings with BBP Pairings and insert them into DB.
 * Returns inserted Match[] on success, or null on failure.
 */
export async function generatePairingsWithBBP(tournamentId: number, roundId: number): Promise<Match[] | null> {
  lastBbpReason = undefined

  // Всегда используем встроенный Swiss pairing генератор (FIDE Dutch System)
  console.log('[BBP] Using built-in Swiss pairing generator (FIDE Dutch System)')
  try {
    const swiss = await generateSwissPairings(tournamentId, roundId)
    if (!swiss || swiss.length === 0) {
      lastBbpReason = 'Swiss pairing produced no matches'
      return null
    }
    return swiss
  } catch (e) {
    lastBbpReason = e instanceof Error ? e.message : String(e)
    console.error('[BBP] Pairing error:', lastBbpReason)
    return null
  }
}

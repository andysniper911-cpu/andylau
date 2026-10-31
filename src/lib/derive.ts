import { SENATE_NOT_UP, SENATE_UP, STATE_BY_ABBR } from '../data/states.ts'
import type { EarlyState, HouseRace, Party, Race, Snapshot } from './types.ts'

export type EarlyTotals = {
  voted: number
  dem: number
  rep: number
  unaffiliated: number
  mail: number
  inPerson: number
  partyStates: number
  reporting: number
}

export type Bead = {
  key: string
  kind: 'hold-d' | 'hold-i' | 'hold-r' | 'race'
  pDem: number
  label: string
}

export function pct(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const rounded = Math.round(value * 1000) / 10
  if (rounded >= 99.95) return '99.9'
  return rounded.toFixed(1).replace(/\.0$/, '')
}

export function formatInt(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}

export function formatWan(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}亿`
  if (value >= 10_000) {
    const wan = value / 10_000
    return `${wan >= 100 ? wan.toFixed(0) : wan.toFixed(1)}万`
  }
  return formatInt(value)
}

export function partyLabel(party: Party | 'hold'): string {
  if (party === 'D') return '民主党'
  if (party === 'R') return '共和党'
  if (party === 'I') return '独立'
  return '其他'
}

export function earlyTotals(rows: EarlyState[]): EarlyTotals {
  const totals: EarlyTotals = {
    voted: 0,
    dem: 0,
    rep: 0,
    unaffiliated: 0,
    mail: 0,
    inPerson: 0,
    partyStates: 0,
    reporting: 0,
  }
  for (const row of rows) {
    if (row.voted > 0) totals.reporting += 1
    totals.voted += row.voted
    totals.mail += row.mail
    totals.inPerson += row.inPerson
    if (row.dem + row.rep > 0) {
      totals.dem += row.dem
      totals.rep += row.rep
      totals.unaffiliated += row.unaffiliated
      totals.partyStates += 1
    }
  }
  return totals
}

export function earlyByAbbr(rows: EarlyState[]): Map<string, EarlyState> {
  return new Map(rows.map((row) => [row.abbr, row]))
}

export function share(part: number, whole: number): number {
  return whole > 0 ? part / whole : 0
}

export function earlyFill(row: EarlyState | undefined): string {
  if (!row || row.dem + row.rep <= 0) return '#1a2c48'
  const margin = (row.dem - row.rep) / (row.dem + row.rep)
  if (margin >= 0.2) return '#1d4ed8'
  if (margin >= 0.08) return '#3b82f6'
  if (margin >= 0.03) return '#93c5fd'
  if (margin <= -0.2) return '#be123c'
  if (margin <= -0.08) return '#e11d48'
  if (margin <= -0.03) return '#fda4af'
  return '#d8b4fe'
}

export function chanceFill(pDem: number | null, leader: Party | null, active: boolean): string {
  if (!active || leader == null || pDem == null) return '#152238'
  if (leader === 'I' || leader === 'O') return '#7c3aed'
  const strength = leader === 'D' ? pDem : 1 - pDem
  if (strength < 0.56) return leader === 'D' ? '#c4b5fd' : '#e9d5ff'
  if (leader === 'D') {
    if (strength >= 0.9) return '#1d4ed8'
    if (strength >= 0.75) return '#2563eb'
    return '#60a5fa'
  }
  if (strength >= 0.9) return '#be123c'
  if (strength >= 0.75) return '#e11d48'
  return '#fb7185'
}

export function raceDemShare(race: Pick<Race, 'dem' | 'rep' | 'other'>): number {
  const total = race.dem + race.rep + race.other
  if (total <= 0) return 0.5
  return race.dem / total
}

export function houseDemShare(race: Pick<HouseRace, 'dem' | 'rep'>): number {
  const total = race.dem + race.rep
  if (total <= 0) return 0.5
  return race.dem / total
}

export function senateBeads(races: Race[]): Bead[] {
  const byState = new Map(races.map((race) => [race.state, race]))
  const beads: Bead[] = []
  for (let i = 0; i < SENATE_NOT_UP.dem; i += 1) {
    beads.push({ key: `d-${i}`, kind: 'hold-d', pDem: 1, label: '未改选民主党席位' })
  }
  for (let i = 0; i < SENATE_NOT_UP.independentCaucus; i += 1) {
    beads.push({ key: `i-${i}`, kind: 'hold-i', pDem: 1, label: '未改选独立参议员，现与民主党团一起投票' })
  }
  const racesUp = SENATE_UP.map((seat) => {
    const race = byState.get(seat.abbr)
    const pDem = race ? raceDemShare(race) : seat.incumbent === 'D' ? 0.85 : 0.15
    const zh = STATE_BY_ABBR[seat.abbr]?.zh ?? seat.abbr
    const label = race
      ? `${zh}：${race.leaderName} ${pct(race.leaderPrice)}%`
      : `${zh}：暂无市场，沿用开选前${seat.incumbent === 'D' ? '民主党' : '共和党'}席位`
    return { seat, race, pDem, label }
  }).sort((a, b) => b.pDem - a.pDem)

  for (const item of racesUp) {
    beads.push({ key: item.seat.abbr, kind: 'race', pDem: item.pDem, label: item.label })
  }
  for (let i = 0; i < SENATE_NOT_UP.rep; i += 1) {
    beads.push({ key: `r-${i}`, kind: 'hold-r', pDem: 0, label: '未改选共和党席位' })
  }
  return beads
}

export function senateCall(races: Race[]): { dem: number; rep: number; other: number } {
  const byState = new Map(races.map((race) => [race.state, race]))
  let dem = SENATE_NOT_UP.dem + SENATE_NOT_UP.independentCaucus
  let rep = SENATE_NOT_UP.rep
  let other = 0
  for (const seat of SENATE_UP) {
    const race = byState.get(seat.abbr)
    const party = race?.leaderParty ?? seat.incumbent
    if (party === 'D') dem += 1
    else if (party === 'R') rep += 1
    else other += 1
  }
  return { dem, rep, other }
}

export function senateExpected(races: Race[]): { dem: number; rep: number } {
  const byState = new Map(races.map((race) => [race.state, race]))
  let dem = SENATE_NOT_UP.dem + SENATE_NOT_UP.independentCaucus
  let rep = SENATE_NOT_UP.rep
  for (const seat of SENATE_UP) {
    const race = byState.get(seat.abbr)
    if (!race) {
      if (seat.incumbent === 'D') dem += 1
      else rep += 1
      continue
    }
    const pDem = raceDemShare(race)
    dem += pDem
    rep += 1 - pDem
  }
  return { dem, rep }
}

export function houseExpected(races: HouseRace[]): { dem: number; rep: number; count: number } {
  let dem = 0
  let rep = 0
  for (const race of races) {
    const pDem = houseDemShare(race)
    dem += pDem
    rep += 1 - pDem
  }
  return { dem, rep, count: races.length }
}

export function houseStateShare(races: HouseRace[]): Map<string, { pDem: number; count: number }> {
  const grouped = new Map<string, HouseRace[]>()
  for (const race of races) {
    const list = grouped.get(race.state) ?? []
    list.push(race)
    grouped.set(race.state, list)
  }
  const shares = new Map<string, { pDem: number; count: number }>()
  for (const [state, list] of grouped) {
    const pDem = list.reduce((sum, race) => sum + houseDemShare(race), 0) / list.length
    shares.set(state, { pDem, count: list.length })
  }
  return shares
}

export function closeness(dem: number, rep: number): number {
  const total = dem + rep
  if (total <= 0) return 1
  return Math.abs(dem / total - 0.5)
}

export function countdown(now: Date, target: Date): { days: number; hours: number; minutes: number; seconds: number; arrived: boolean } {
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, arrived: true }
  const total = Math.floor(diff / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    arrived: false,
  }
}

export function clock(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(now)
}

export function freshLabel(fetchedAt: string, now: Date): string {
  const then = new Date(fetchedAt).getTime()
  if (!Number.isFinite(then)) return '时间不明'
  const seconds = Math.max(0, Math.round((now.getTime() - then) / 1000))
  if (seconds < 15) return '刚刚'
  if (seconds < 60) return `${seconds} 秒前`
  const minutes = Math.round(seconds / 60)
  return `${minutes} 分钟前`
}

export function snapshotAgeOk(snapshot: Snapshot): boolean {
  return snapshot.senateRaces.length > 0 && snapshot.early.length > 0
}

export function inkOn(fill: string): string {
  const hex = fill.replace('#', '')
  if (hex.length !== 6) return '#f8fbff'
  const channel = (start: number) => Number.parseInt(hex.slice(start, start + 2), 16)
  const luminance = (channel(0) * 299 + channel(2) * 587 + channel(4) * 114) / 1000
  return luminance > 155 ? '#102033' : '#f8fbff'
}

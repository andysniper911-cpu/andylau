import { STATE_BY_NAME } from '../data/states.ts'
import type { EarlyState, HouseRace, Party, Race, Snapshot } from './types.ts'

const PARTY_HINT: Record<string, Party> = {
  'mary peltola': 'D',
  'sen. dan sullivan': 'R',
  'dan sullivan': 'R',
  'jonathan kreiss-tomkins': 'D',
  'bernadette wilson': 'R',
  'xavier becerra': 'D',
  'steve hilton': 'R',
}

type RawMarket = {
  groupItemTitle?: string
  outcomePrices?: unknown
  volume?: unknown
}

type RawEvent = {
  title?: string
  slug?: string
  markets?: RawMarket[]
}

export function yesPrice(raw: unknown): number | null {
  let prices = raw
  if (typeof prices === 'string') {
    try {
      prices = JSON.parse(prices) as unknown
    } catch {
      return null
    }
  }
  if (!Array.isArray(prices) || prices.length === 0) return null
  const value = Number(prices[0])
  return Number.isFinite(value) ? value : null
}

function partyOf(name: string): Party | null {
  const marked = name.match(/\((D|R|I|DFL)\)\s*$/)
  if (marked) {
    if (marked[1] === 'D' || marked[1] === 'DFL') return 'D'
    if (marked[1] === 'R') return 'R'
    return 'I'
  }
  const plain = name.trim().toLowerCase()
  if (plain === 'democrat' || plain === 'democratic party') return 'D'
  if (plain === 'republican' || plain === 'republican party') return 'R'
  if (plain === 'independent') return 'I'
  return PARTY_HINT[plain.replace(/\s+/g, ' ')] ?? null
}

function cleanName(name: string): string {
  return name.replace(/\s*\((D|R|I|DFL)\)\s*$/, '').trim()
}

function volumeOf(raw: unknown): number {
  const value = Number(raw ?? 0)
  return Number.isFinite(value) ? value : 0
}

function isSettled(prices: number[]): boolean {
  const top = [...prices].sort((a, b) => b - a)
  return top[0] >= 0.995 && (top.length === 1 || top[1] <= 0.01)
}

type Best = { volume: number; race: Race }

function consider(
  bucket: Map<string, Best>,
  event: RawEvent,
  office: 'senate' | 'governor',
  suffix: string,
) {
  const title = (event.title ?? '').trim()
  if (!title.endsWith(suffix) || title.includes(':') || /primary/i.test(title)) return
  const stateName = title.slice(0, -suffix.length).trim()
  const abbr = STATE_BY_NAME[stateName]
  if (!abbr || abbr === 'DC') return

  const priced = (event.markets ?? [])
    .map((market) => {
      const name = (market.groupItemTitle ?? '').trim()
      const price = yesPrice(market.outcomePrices)
      if (!name || price == null) return null
      if (/^(person|party)\b/i.test(name)) return null
      return { name, price, volume: volumeOf(market.volume), party: partyOf(name) }
    })
    .filter((item): item is NonNullable<typeof item> => item != null)

  if (priced.length < 2 || isSettled(priced.map((item) => item.price))) return

  let dem = 0
  let rep = 0
  let other = 0
  let demName = ''
  let repName = ''
  let otherName = ''
  for (const item of priced) {
    if (item.party === 'D' && item.price >= dem) {
      dem = item.price
      demName = cleanName(item.name)
    } else if (item.party === 'R' && item.price >= rep) {
      rep = item.price
      repName = cleanName(item.name)
    } else if ((item.party === 'I' || item.party == null) && item.price >= other) {
      other = item.price
      otherName = cleanName(item.name)
    }
  }

  const ranked = [...priced].sort((a, b) => b.price - a.price)
  const leader = ranked[0]
  if (!leader) return
  const race: Race = {
    state: abbr,
    office,
    dem,
    rep,
    other,
    demName,
    repName,
    otherName,
    leaderParty: leader.party ?? 'O',
    leaderName: cleanName(leader.name),
    leaderPrice: leader.price,
  }
  const volume = priced.reduce((sum, item) => sum + item.volume, 0)
  const prev = bucket.get(abbr)
  if (!prev || volume > prev.volume) bucket.set(abbr, { volume, race })
}

export function racesFromEvents(events: RawEvent[], office: 'senate' | 'governor'): Race[] {
  const suffix = office === 'senate' ? 'Senate Election Winner' : 'Governor Election Winner'
  const bucket = new Map<string, Best>()
  for (const event of events) consider(bucket, event, office, suffix)
  return [...bucket.values()]
    .map((item) => item.race)
    .sort((a, b) => a.state.localeCompare(b.state))
}

const HOUSE_TITLE = /^([A-Z]{2})-(\d{1,2}|AL) House Election Winner$/

export function houseFromEvents(events: RawEvent[]): HouseRace[] {
  const bucket = new Map<string, { volume: number; race: HouseRace }>()
  for (const event of events) {
    const title = (event.title ?? '').trim()
    const match = title.match(HOUSE_TITLE)
    if (!match) continue
    const state = match[1]
    const dist = match[2] === 'AL' ? 'AL' : String(Number(match[2]))
    const code = `${state}-${dist}`
    let dem = 0
    let rep = 0
    let demName = ''
    let repName = ''
    let volume = 0
    for (const market of event.markets ?? []) {
      volume += volumeOf(market.volume)
      const name = (market.groupItemTitle ?? '').trim()
      const price = yesPrice(market.outcomePrices)
      if (!name || price == null || /^(other|[a-e])$/i.test(name)) continue
      const party = partyOf(name)
      if (party === 'D' && price >= dem) {
        dem = price
        demName = cleanName(name)
      } else if (party === 'R' && price >= rep) {
        rep = price
        repName = cleanName(name)
      }
    }
    if (dem <= 0 && rep <= 0) continue
    const race: HouseRace = { code, state, dem, rep, demName, repName }
    const prev = bucket.get(code)
    if (!prev || volume > prev.volume) bucket.set(code, { volume, race })
  }
  return [...bucket.values()]
    .map((item) => item.race)
    .sort((a, b) => a.code.localeCompare(b.code))
}

export function parseEarlyCsv(text: string): EarlyState[] {
  const lines = text.trim().split(/\r?\n/)
  const header = lines[0]?.split(',') ?? []
  const index = Object.fromEntries(header.map((key, i) => [key, i]))
  const need = ['state_abbv', 'voted_all', 'voted_dem', 'voted_rep', 'voted_none', 'accept_all', 'inperson_all', 'last_update']
  if (need.some((key) => index[key] == null)) return []

  const rows: EarlyState[] = []
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cells = splitCsvLine(line)
    const num = (key: string) => {
      const value = Number(cells[index[key]] ?? 0)
      return Number.isFinite(value) ? value : 0
    }
    const abbr = cells[index.state_abbv] ?? ''
    if (!abbr) continue
    rows.push({
      abbr,
      voted: num('voted_all'),
      dem: num('voted_dem'),
      rep: num('voted_rep'),
      unaffiliated: num('voted_none'),
      mail: num('accept_all'),
      inPerson: num('inperson_all'),
      updated: cells[index.last_update] ?? '',
    })
  }
  return rows
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells
}

export function controlFromMarket(raw: { outcomePrices?: unknown } | null): number | null {
  if (!raw) return null
  return yesPrice(raw.outcomePrices)
}

export function governorControlFromEvent(event: RawEvent | null): { dem: number; rep: number; tie: number } | null {
  if (!event) return null
  let dem = 0
  let rep = 0
  let tie = 0
  let seen = false
  for (const market of event.markets ?? []) {
    const name = (market.groupItemTitle ?? '').toLowerCase()
    const price = yesPrice(market.outcomePrices)
    if (price == null) continue
    if (name.includes('democrat')) {
      dem = price
      seen = true
    } else if (name.includes('republican')) {
      rep = price
      seen = true
    } else if (name.includes('tie')) {
      tie = price
      seen = true
    }
  }
  return seen ? { dem, rep, tie } : null
}

export function emptyControl() {
  return { dem: 0, rep: 0, tie: 0 }
}

export function withLiveFlag(snapshot: Snapshot, live: boolean, fetchedAt: string): Snapshot {
  return { ...snapshot, live, fetchedAt }
}

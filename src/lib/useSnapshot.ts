import { useCallback, useEffect, useState } from 'react'
import fallback from '../data/fallback.ts'
import {
  controlFromMarket,
  governorControlFromEvent,
  houseFromEvents,
  parseEarlyCsv,
  racesFromEvents,
} from './parse.ts'
import type { Snapshot } from './types.ts'

type RawEvent = { markets?: { groupItemTitle?: string; outcomePrices?: unknown }[] }

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.json() as Promise<T>
}

async function search(query: string, pages: number) {
  const batches = await Promise.all(
    Array.from({ length: pages }, (_, index) =>
      getJson<{ events?: unknown[]; pagination?: { hasMore?: boolean } }>(
        `/api/gamma/public-search?q=${encodeURIComponent(query)}&page=${index + 1}&limit_per_type=50`,
      ).catch(() => null),
    ),
  )
  const events: RawEvent[] = []
  for (const batch of batches) {
    if (Array.isArray(batch?.events)) events.push(...(batch.events as RawEvent[]))
  }
  return events
}

export function useSnapshot() {
  const [snap, setSnap] = useState<Snapshot>(fallback)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const [senateMarket, houseMarket, governorEvent, earlyText, senateEvents, governorEvents, houseEvents] =
        await Promise.all([
          getJson<{ outcomePrices?: unknown }>(
            '/api/gamma/markets/slug/will-the-democratic-party-control-the-senate-after-the-2026-midterm-elections',
          ),
          getJson<{ outcomePrices?: unknown }>(
            '/api/gamma/markets/slug/will-the-democratic-party-control-the-house-after-the-2026-midterm-elections',
          ),
          getJson<RawEvent[]>('/api/gamma/events?slug=which-party-will-hold-more-governorships-after-the-midterms'),
          fetch('/api/earlyvote/data-downloads/earlyvote/2026/US.csv').then((response) => {
            if (!response.ok) throw new Error('early vote')
            return response.text()
          }),
          search('senate election winner', 4),
          search('governor election winner', 4),
          search('house election winner', 14),
        ])

      const senateDem = controlFromMarket(senateMarket)
      const houseDem = controlFromMarket(houseMarket)
      const governor = governorControlFromEvent(Array.isArray(governorEvent) ? governorEvent[0] : null)
      const early = parseEarlyCsv(earlyText)
      const senateRaces = racesFromEvents(senateEvents, 'senate')
      const governorRaces = racesFromEvents(governorEvents, 'governor')
      const houseRaces = houseFromEvents(houseEvents)

      setSnap((prev) => ({
        fetchedAt: new Date().toISOString(),
        live: true,
        senateControl:
          senateDem == null ? prev.senateControl : { dem: senateDem, rep: Math.max(0, 1 - senateDem), tie: 0 },
        houseControl:
          houseDem == null ? prev.houseControl : { dem: houseDem, rep: Math.max(0, 1 - houseDem), tie: 0 },
        governorControl: governor ?? prev.governorControl,
        senateRaces: senateRaces.length >= 30 ? senateRaces : prev.senateRaces,
        governorRaces: governorRaces.length >= 30 ? governorRaces : prev.governorRaces,
        houseRaces: houseRaces.length >= 400 ? houseRaces : prev.houseRaces,
        early: early.length >= 40 ? early : prev.early,
      }))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '刷新失败')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const started = window.setTimeout(() => {
      void refresh()
    }, 300)
    const timer = window.setInterval(() => {
      void refresh()
    }, 60_000)
    return () => {
      window.clearTimeout(started)
      window.clearInterval(timer)
    }
  }, [refresh])

  return { snap, error, refreshing, refresh }
}

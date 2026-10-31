import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BoardView } from './components/BoardView.tsx'
import { type ViewId } from './components/Chrome.tsx'
import { ForecastView } from './components/ForecastView.tsx'
import { useSnapshot } from './lib/useSnapshot.ts'

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

function useWide() {
  const query = '(min-width: 1180px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return wide
}

function Stage({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const node = frame.current
    if (!node) return
    const fit = () => {
      const next = Math.min(node.clientWidth / 1920, node.clientHeight / 1080)
      setScale(next > 0 ? next : 1)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="stage-viewport" ref={frame}>
      <div className="stage-scale" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const { snap, error, refreshing, refresh } = useSnapshot()
  const now = useNow()
  const wide = useWide()
  const [view, setView] = useState<ViewId>(() => {
    const value = new URLSearchParams(window.location.search).get('view')
    if (value === 'senate' || value === 'house' || value === 'governor' || value === 'board') return value
    return 'board'
  })

  useEffect(() => {
    const url = new URL(window.location.href)
    if (view === 'board') url.searchParams.delete('view')
    else url.searchParams.set('view', view)
    window.history.replaceState(null, '', url)
  }, [view])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && target.closest('input, select, textarea')) return
      const next: Record<string, ViewId> = { '1': 'board', '2': 'senate', '3': 'house', '4': 'governor' }
      if (next[event.key]) setView(next[event.key])
      if (event.key === 'r' || event.key === 'R') void refresh()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [refresh])

  const screen =
    view === 'board' ? (
      <BoardView
        snap={snap}
        now={now}
        refreshing={refreshing}
        error={error}
        fixed={wide}
        onRefresh={() => void refresh()}
        onView={setView}
      />
    ) : (
      <ForecastView
        view={view}
        snap={snap}
        now={now}
        refreshing={refreshing}
        error={error}
        fixed={wide}
        onRefresh={() => void refresh()}
        onView={setView}
      />
    )

  return <div className={wide ? 'shell' : 'shell is-scroll'}>{wide ? <Stage>{screen}</Stage> : screen}</div>
}

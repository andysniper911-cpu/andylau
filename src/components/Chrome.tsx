import { ELECTION_START } from '../data/states.ts'
import { clock, countdown, freshLabel, pct } from '../lib/derive.ts'
import type { Snapshot } from '../lib/types.ts'

export type ViewId = 'board' | 'senate' | 'house' | 'governor'

const TABS: { id: ViewId; label: (snap: Snapshot) => string }[] = [
  { id: 'board', label: () => '总览' },
  { id: 'senate', label: (snap) => `参议院 ${pct(snap.senateControl.dem)}%` },
  { id: 'house', label: (snap) => `众议院 ${pct(snap.houseControl.dem)}%` },
  { id: 'governor', label: (snap) => `州长 ${pct(snap.governorControl.dem)}%` },
]

export function Tabs({
  view,
  snap,
  onView,
}: {
  view: ViewId
  snap: Snapshot
  onView: (view: ViewId) => void
}) {
  return (
    <div className="tabs" role="tablist" aria-label="画面切换">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={view === tab.id}
          className={view === tab.id ? 'is-on' : undefined}
          onClick={() => onView(tab.id)}
        >
          {tab.label(snap)}
        </button>
      ))}
    </div>
  )
}

export function Countdown({ now }: { now: Date }) {
  const left = countdown(now, ELECTION_START)
  const parts = left.arrived
    ? [
        { n: '0', u: '天' },
        { n: '00', u: '时' },
        { n: '00', u: '分' },
        { n: '00', u: '秒' },
      ]
    : [
        { n: String(left.days), u: '天' },
        { n: String(left.hours).padStart(2, '0'), u: '时' },
        { n: String(left.minutes).padStart(2, '0'), u: '分' },
        { n: String(left.seconds).padStart(2, '0'), u: '秒' },
      ]

  return (
    <div className="countdown">
      <p>{left.arrived ? '选举日已开始' : '距选举日 11 月 3 日 0:00'}</p>
      <div className="countdown__digits">
        {parts.map((part) => (
          <span key={part.u}>
            <b>{part.n}</b>
            <small>{part.u}</small>
          </span>
        ))}
      </div>
      <p className="countdown__clock">
        美东 {clock(now, 'America/New_York')}
        <span> · 太平洋 {clock(now, 'America/Los_Angeles')}</span>
      </p>
    </div>
  )
}

export function StatusLine({
  snap,
  now,
  refreshing,
  error,
  onRefresh,
}: {
  snap: Snapshot
  now: Date
  refreshing: boolean
  error: string | null
  onRefresh: () => void
}) {
  return (
    <footer className="statusbar">
      <span className={snap.live ? 'live is-live' : 'live'}>{snap.live ? '实时' : '快照'}</span>
      <span>{refreshing ? '正在刷新' : freshLabel(snap.fetchedAt, now)}</span>
      {error ? <span className="status-error">行情暂不可用，画面留在上一份数据</span> : null}
      <span className="status-src">
        提前票来自佛罗里达大学选举实验室；控院与候选人价格来自 Polymarket。党籍是选民登记，不是候选人得票，也不是官方计票。
      </span>
      <button type="button" onClick={onRefresh}>
        刷新
      </button>
    </footer>
  )
}

export function Lighthouse() {
  return (
    <svg className="mark" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 4 28 14H20L24 4Z" fill="#f5c451" />
      <path d="M18 16h12l3 20H15l3-20Z" fill="#7fd4ff" />
      <path d="M14 36h20v4H14z" fill="#d7e8ff" />
      <path d="M8 14h6M34 14h6M6 20h7M35 20h7" stroke="#f5c451" strokeWidth="1.6" />
    </svg>
  )
}

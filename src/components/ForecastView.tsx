import { useMemo, useState } from 'react'
import { STATE_BY_ABBR } from '../data/states.ts'
import {
  chanceFill,
  closeness,
  earlyByAbbr,
  formatWan,
  houseDemShare,
  houseExpected,
  houseStateShare,
  partyLabel,
  pct,
  raceDemShare,
  senateBeads,
  senateCall,
  senateExpected,
} from '../lib/derive.ts'
import type { EarlyState, HouseRace, Race, Snapshot } from '../lib/types.ts'
import { StatusLine, Tabs, type ViewId } from './Chrome.tsx'
import { UsMap, type MapDetail } from './UsMap.tsx'

type ForecastProps = {
  view: Exclude<ViewId, 'board'>
  snap: Snapshot
  now: Date
  refreshing: boolean
  error: string | null
  fixed?: boolean
  onRefresh: () => void
  onView: (view: ViewId) => void
}

type Side = 'close' | 'D' | 'R'

export function ForecastView(props: ForecastProps) {
  const { snap, view } = props
  const [selected, setSelected] = useState<string | null>(null)
  const [side, setSide] = useState<Side>('close')
  const early = useMemo(() => earlyByAbbr(snap.early), [snap.early])

  const headline =
    view === 'senate'
      ? `民主党控制参议院的概率为 ${pct(snap.senateControl.dem)}%`
      : view === 'house'
        ? `民主党控制众议院的概率为 ${pct(snap.houseControl.dem)}%`
        : `民主党州长席位更多的概率为 ${pct(snap.governorControl.dem)}%`

  const control =
    view === 'senate' ? snap.senateControl : view === 'house' ? snap.houseControl : snap.governorControl

  return (
    <section className={props.fixed ? 'forecast is-fixed' : 'forecast'} aria-label={headline}>
      <Tabs view={view} snap={snap} onView={props.onView} />
      <header className="forecast__hero">
        <div>
          <p className="eyebrow">{view === 'senate' ? 'SENATE' : view === 'house' ? 'HOUSE' : 'GOVERNORS'}</p>
          <h1>{headline}</h1>
        </div>
        <div className="pills">
          <span className="pill pill--d">DEM {pct(control.dem)}%</span>
          <span className="pill pill--r">REP {pct(control.rep)}%</span>
          {view === 'governor' && control.tie > 0.005 ? (
            <span className="pill pill--tie">平局 {pct(control.tie)}%</span>
          ) : null}
        </div>
      </header>

      {view === 'senate' ? <SenateBar races={snap.senateRaces} /> : null}
      {view === 'house' ? <HouseBar races={snap.houseRaces} /> : null}
      {view === 'governor' ? <GovernorBar races={snap.governorRaces} /> : null}

      <div className="forecast__body">
        <div className="forecast__map">
          {view === 'senate' ? (
            <SenateMap races={snap.senateRaces} early={early} selected={selected} onSelect={setSelected} />
          ) : null}
          {view === 'house' ? (
            <HouseMap races={snap.houseRaces} selected={selected} onSelect={setSelected} />
          ) : null}
          {view === 'governor' ? (
            <GovernorMap races={snap.governorRaces} early={early} selected={selected} onSelect={setSelected} />
          ) : null}
        </div>
        <aside className="rail">
          <div className="rail__bar">
            <h2>{view === 'house' ? '最接近的选区' : '最接近的州'}</h2>
            <label>
              排序
              <select value={side} onChange={(event) => setSide(event.target.value as Side)}>
                <option value="close">最接近</option>
                <option value="D">民主党领先</option>
                <option value="R">共和党领先</option>
              </select>
            </label>
          </div>
          {view === 'house' ? (
            <HouseList races={snap.houseRaces} side={side} selected={selected} onSelect={setSelected} />
          ) : (
            <RaceList
              races={view === 'senate' ? snap.senateRaces : snap.governorRaces}
              office={view === 'senate' ? '参议院' : '州长'}
              side={side}
              selected={selected}
              onSelect={setSelected}
            />
          )}
        </aside>
      </div>
      <StatusLine
        snap={snap}
        now={props.now}
        refreshing={props.refreshing}
        error={props.error}
        onRefresh={props.onRefresh}
      />
    </section>
  )
}

function SenateBar({ races }: { races: Race[] }) {
  const beads = senateBeads(races)
  const call = senateCall(races)
  const expected = senateExpected(races)
  return (
    <div className="scoreblock">
      <div className="scoreline">
        <strong className="is-dem">{call.dem} DEM</strong>
        <span>过半数 51 · 开选前 47 / 53</span>
        <strong className="is-rep">REP {call.rep}</strong>
      </div>
      <div className="seatbar" role="img" aria-label={`胜率领先席位 民主党团 ${call.dem}，共和党 ${call.rep}`}>
        {beads.map((bead) => (
          <i
            key={bead.key}
            title={bead.label}
            className={`bead bead--${bead.kind}${bead.kind === 'race' && bead.pDem > 0.44 && bead.pDem < 0.56 ? ' is-toss' : ''}`}
            style={bead.kind === 'race' ? { background: chanceFill(bead.pDem, bead.pDem >= 0.5 ? 'D' : 'R', true) } : undefined}
          />
        ))}
        <em className="seatbar__mark" />
      </div>
      <p>
        珠子从左到右是未改选民主党、两名现任独立参议员、35 场改选（按民主党胜率排序）、未改选共和党。
        胜率相加的期望大约是民主党团 {expected.dem.toFixed(1)} 席、共和党 {expected.rep.toFixed(1)} 席。
        {call.other > 0 ? ` 另有 ${call.other} 席领先的是独立或其他候选人。` : ''}
      </p>
    </div>
  )
}

function HouseBar({ races }: { races: HouseRace[] }) {
  const expected = houseExpected(races)
  const total = expected.dem + expected.rep || 1
  return (
    <div className="scoreblock">
      <div className="scoreline">
        <strong className="is-dem">{Math.round(expected.dem)} DEM</strong>
        <span>过半数 218 · {expected.count} / 435 个选区有报价</span>
        <strong className="is-rep">REP {Math.round(expected.rep)}</strong>
      </div>
      <div className="expect" role="img" aria-label="众议院期望席位">
        <i className="is-dem" style={{ width: `${(expected.dem / total) * 100}%` }} />
        <i className="is-rep" style={{ width: `${(expected.rep / total) * 100}%` }} />
        <em style={{ left: `${(218 / 435) * 100}%` }} />
      </div>
      <p>
        这是把每个选区的民主党成交价除以两党价格之和再相加，得到期望席位，不是某家模型的中位数。
        目前缺 CA-40 的报价，所以总数是 {expected.count}。
      </p>
    </div>
  )
}

function GovernorBar({ races }: { races: Race[] }) {
  const call = { dem: 0, rep: 0, other: 0 }
  for (const race of races) {
    if (race.leaderParty === 'D') call.dem += 1
    else if (race.leaderParty === 'R') call.rep += 1
    else call.other += 1
  }
  return (
    <div className="scoreblock">
      <div className="scoreline">
        <strong className="is-dem">{call.dem} 州领先</strong>
        <span>36 个州长席位改选</span>
        <strong className="is-rep">{call.rep} 州领先</strong>
      </div>
      <div className="expect" role="img" aria-label="州长领先州数">
        <i className="is-dem" style={{ width: `${(call.dem / 36) * 100}%` }} />
        <i className="is-other" style={{ width: `${(call.other / 36) * 100}%` }} />
        <i className="is-rep" style={{ width: `${(call.rep / 36) * 100}%` }} />
      </div>
      <p>上面的大数字是“民主党州长数量超过共和党”的市场价格。色条是各州目前谁的价格更高，两件事不是同一个数。</p>
    </div>
  )
}

function SenateMap({
  races,
  early,
  selected,
  onSelect,
}: {
  races: Race[]
  early: Map<string, EarlyState>
  selected: string | null
  onSelect: (abbr: string) => void
}) {
  const byState = new Map(races.map((race) => [race.state, race]))
  const detail = (abbr: string): MapDetail => {
    const race = byState.get(abbr)
    const meta = STATE_BY_ABBR[abbr]
    if (!race) return { title: `${meta?.zh ?? abbr}`, lines: ['今年不改选'] }
    return {
      title: `${meta?.zh ?? abbr} 参议院`,
      lines: [
        `${race.demName || '民主党'} ${pct(race.dem)}%`,
        `${race.repName || '共和党'} ${pct(race.rep)}%`,
        early.get(abbr)?.voted ? `提前票 ${formatWan(early.get(abbr)?.voted ?? 0)}` : '暂无提前票',
      ],
    }
  }
  return (
    <UsMap
      selected={selected}
      onSelect={onSelect}
      detail={detail}
      fill={(abbr) => {
        const race = byState.get(abbr)
        return chanceFill(race ? raceDemShare(race) : null, race?.leaderParty ?? null, Boolean(race))
      }}
    />
  )
}

function HouseMap({
  races,
  selected,
  onSelect,
}: {
  races: HouseRace[]
  selected: string | null
  onSelect: (abbr: string) => void
}) {
  const shares = houseStateShare(races)
  const detail = (abbr: string): MapDetail => {
    const meta = STATE_BY_ABBR[abbr]
    const share = shares.get(abbr)
    if (!share) return { title: meta?.zh ?? abbr, lines: ['没有选区报价'] }
    return {
      title: `${meta?.zh ?? abbr} 众议院`,
      lines: [`${share.count} 个选区有报价`, `州内平均民主党胜率 ${pct(share.pDem)}%`],
    }
  }
  return (
    <>
      <UsMap
        selected={selected}
        onSelect={onSelect}
        detail={detail}
        fill={(abbr) => {
          const share = shares.get(abbr)
          if (!share) return '#152238'
          return chanceFill(share.pDem, share.pDem >= 0.5 ? 'D' : 'R', true)
        }}
      />
      <p className="panel__note">地图是一州一色，颜色取该州已有选区胜率的平均。选区边界没有画出来。</p>
    </>
  )
}

function GovernorMap({
  races,
  early,
  selected,
  onSelect,
}: {
  races: Race[]
  early: Map<string, EarlyState>
  selected: string | null
  onSelect: (abbr: string) => void
}) {
  const byState = new Map(races.map((race) => [race.state, race]))
  const detail = (abbr: string): MapDetail => {
    const race = byState.get(abbr)
    const meta = STATE_BY_ABBR[abbr]
    if (!race) return { title: meta?.zh ?? abbr, lines: ['今年不选州长'] }
    return {
      title: `${meta?.zh ?? abbr} 州长`,
      lines: [
        `${race.leaderName} ${pct(race.leaderPrice)}% ${partyLabel(race.leaderParty)}`,
        early.get(abbr)?.voted ? `提前票 ${formatWan(early.get(abbr)?.voted ?? 0)}` : '暂无提前票',
      ],
    }
  }
  return (
    <UsMap
      selected={selected}
      onSelect={onSelect}
      detail={detail}
      fill={(abbr) => {
        const race = byState.get(abbr)
        return chanceFill(race ? raceDemShare(race) : null, race?.leaderParty ?? null, Boolean(race))
      }}
    />
  )
}

function RaceList({
  races,
  office,
  side,
  selected,
  onSelect,
}: {
  races: Race[]
  office: string
  side: Side
  selected: string | null
  onSelect: (abbr: string) => void
}) {
  const rows = [...races]
    .filter((race) => (side === 'close' ? true : race.leaderParty === side))
    .sort((a, b) => {
      if (side === 'D') return b.dem - a.dem
      if (side === 'R') return b.rep - a.rep
      return closeness(a.dem, a.rep) - closeness(b.dem, b.rep)
    })
    .slice(0, 10)

  return (
    <ul className="racelist">
      {rows.map((race) => {
        const meta = STATE_BY_ABBR[race.state]
        const p = race.leaderPrice
        return (
          <li key={race.state}>
            <button
              type="button"
              className={selected === race.state ? 'is-on' : undefined}
              onClick={() => onSelect(race.state)}
            >
              <span className={`dot dot--${race.leaderParty}`} />
              <span className="racelist__name">
                {meta?.en ?? race.state} {office}
                <small>
                  {race.leaderName} · {meta?.zh}
                </small>
              </span>
              <span className={`racelist__pct is-${race.leaderParty}`}>
                {pct(p)}% {partyLabel(race.leaderParty)}
              </span>
              <span className="racelist__bar" aria-hidden="true">
                <i
                  className={race.leaderParty === 'R' ? 'is-rep' : undefined}
                  style={{ width: `${Math.max(6, p * 100)}%` }}
                />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function HouseList({
  races,
  side,
  selected,
  onSelect,
}: {
  races: HouseRace[]
  side: Side
  selected: string | null
  onSelect: (abbr: string) => void
}) {
  const rows = [...races]
    .map((race) => ({ race, pDem: houseDemShare(race), leader: houseDemShare(race) >= 0.5 ? 'D' as const : 'R' as const }))
    .filter((item) => (side === 'close' ? true : item.leader === side))
    .sort((a, b) => {
      if (side === 'D') return b.pDem - a.pDem
      if (side === 'R') return a.pDem - b.pDem
      return Math.abs(a.pDem - 0.5) - Math.abs(b.pDem - 0.5)
    })
    .slice(0, 10)

  return (
    <ul className="racelist">
      {rows.map(({ race, leader }) => {
        const name = leader === 'D' ? race.demName : race.repName
        const price = leader === 'D' ? race.dem : race.rep
        return (
          <li key={race.code}>
            <button
              type="button"
              className={selected === race.state ? 'is-on' : undefined}
              onClick={() => onSelect(race.state)}
            >
              <span className={`dot dot--${leader}`} />
              <span className="racelist__name">
                {race.code} 众议院
                <small>{name || partyLabel(leader)}</small>
              </span>
              <span className={`racelist__pct is-${leader}`}>
                {pct(price)}% {partyLabel(leader)}
              </span>
              <span className="racelist__bar" aria-hidden="true">
                <i className={leader === 'R' ? 'is-rep' : undefined} style={{ width: `${Math.max(8, price * 100)}%` }} />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { GOVERNOR_STATES, STATE_BY_ABBR } from '../data/states.ts'
import {
  chanceFill,
  earlyByAbbr,
  earlyFill,
  earlyTotals,
  formatInt,
  formatWan,
  inkOn,
  partyLabel,
  pct,
  share,
} from '../lib/derive.ts'
import type { EarlyState, Race, Snapshot } from '../lib/types.ts'
import { UsMap, type MapDetail } from './UsMap.tsx'
import { Countdown, Lighthouse, StatusLine, Tabs, type ViewId } from './Chrome.tsx'

const ROTATION = ['NC', 'RI', 'AZ', 'FL', 'IA', 'KS', 'ME', 'OH', 'NV', 'PA', 'TX', 'GA']

type BoardProps = {
  snap: Snapshot
  now: Date
  refreshing: boolean
  error: string | null
  fixed?: boolean
  onRefresh: () => void
  onView: (view: ViewId) => void
}

export function BoardView(props: BoardProps) {
  const { snap } = props
  const totals = useMemo(() => earlyTotals(snap.early), [snap.early])
  const early = useMemo(() => earlyByAbbr(snap.early), [snap.early])
  const senate = useMemo(() => new Map(snap.senateRaces.map((race) => [race.state, race])), [snap.senateRaces])
  const governors = useMemo(() => new Map(snap.governorRaces.map((race) => [race.state, race])), [snap.governorRaces])
  const [pin, setPin] = useState<string | null>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (pin) return
    const timer = window.setInterval(() => setStep((value) => value + 1), 8000)
    return () => window.clearInterval(timer)
  }, [pin])

  const first = pin ?? ROTATION[step % ROTATION.length]
  const second = ROTATION.find((abbr) => abbr !== first) ?? 'RI'
  const partyWhole = totals.dem + totals.rep
  const senateVoted = [...senate.keys()].reduce((sum, abbr) => sum + (early.get(abbr)?.voted ?? 0), 0)

  const detail = (abbr: string): MapDetail => {
    const meta = STATE_BY_ABBR[abbr]
    const row = early.get(abbr)
    const race = senate.get(abbr)
    const gov = governors.get(abbr)
    const lines: string[] = []
    if (row && row.voted > 0) {
      lines.push(`提前票 ${formatInt(row.voted)} · 更新 ${row.updated}`)
      if (row.dem + row.rep > 0) {
        lines.push(
          `登记民主党 ${pct(share(row.dem, row.voted))}% · 共和党 ${pct(share(row.rep, row.voted))}%`,
        )
      } else {
        lines.push('该州未公布党籍')
      }
    } else {
      lines.push('暂无提前票汇总')
    }
    if (race) lines.push(`参议院 ${race.leaderName} ${pct(race.leaderPrice)}% ${partyLabel(race.leaderParty)}`)
    if (gov) lines.push(`州长 ${gov.leaderName} ${pct(gov.leaderPrice)}% ${partyLabel(gov.leaderParty)}`)
    return { title: meta ? `${meta.zh} ${abbr}` : abbr, lines }
  }

  return (
    <section className={props.fixed ? 'board is-fixed' : 'board'} aria-label="2026 中期选举总览">
      <header className="mast">
        <div className="mast__brand">
          <Lighthouse />
          <div>
            <h1>灯塔国再次点亮</h1>
            <p>2026 美国中期选举 · U.S. MIDTERM ELECTIONS</p>
          </div>
        </div>
        <Countdown now={props.now} />
        <div className="popular">
          <div className="popular__top">
            <span>已公布党籍的提前票</span>
            <b>民主党 {pct(share(totals.dem, partyWhole))}%</b>
            <b className="is-rep">共和党 {pct(share(totals.rep, partyWhole))}%</b>
          </div>
          <div className="split" aria-hidden="true">
            <i style={{ width: `${share(totals.dem, partyWhole) * 100}%` }} />
            <i className="is-rep" style={{ width: `${share(totals.rep, partyWhole) * 100}%` }} />
          </div>
          <div className="popular__nums">
            <span>{formatInt(totals.dem)} 份</span>
            <span>
              领先 {formatInt(Math.abs(totals.dem - totals.rep))} 份
            </span>
            <span>{formatInt(totals.rep)} 份</span>
          </div>
        </div>
      </header>

      <Tabs view="board" snap={snap} onView={props.onView} />

      <div className="board__main">
        <article className="panel">
          <header className="panel__head">
            <div>
              <h2>全国提前投票</h2>
              <p>EARLY VOTE · 按选民登记党籍着色</p>
            </div>
            <dl>
              <div>
                <dt>已汇总</dt>
                <dd>{formatInt(totals.voted)}</dd>
              </div>
              <div>
                <dt>邮寄交回</dt>
                <dd>{formatWan(totals.mail)}</dd>
              </div>
              <div>
                <dt>现场提前</dt>
                <dd>{formatWan(totals.inPerson)}</dd>
              </div>
            </dl>
          </header>
          <UsMap fill={(abbr) => earlyFill(early.get(abbr))} selected={pin} onSelect={setPin} detail={detail} />
          <p className="panel__note">
            {totals.reporting} 个州和特区有票数，其中 {totals.partyStates} 个公布了党籍。灰色表示没有党籍字段。
          </p>
        </article>

        <div className="spotlights">
          <Spotlight abbr={first} early={early.get(first)} senate={senate.get(first)} />
          <Spotlight abbr={second} early={early.get(second)} senate={senate.get(second)} />
          <button type="button" className="pin" onClick={() => setPin(null)} disabled={!pin}>
            {pin ? `${STATE_BY_ABBR[pin]?.zh ?? pin} 已钉住 · 恢复轮播` : '州卡每 8 秒轮换'}
          </button>
        </div>

        <article className="panel">
          <header className="panel__head">
            <div>
              <h2>参议院改选州</h2>
              <p>35 席 · 过半 51 · 价格是成交概率</p>
            </div>
            <dl>
              <div>
                <dt>控院概率</dt>
                <dd>{pct(snap.senateControl.dem)}%</dd>
              </div>
              <div>
                <dt>改选州提前票</dt>
                <dd>{formatWan(senateVoted)}</dd>
              </div>
              <div>
                <dt>开选前</dt>
                <dd>47 / 53</dd>
              </div>
            </dl>
          </header>
          <UsMap
            fill={(abbr) => {
              const race = senate.get(abbr)
              return chanceFill(race ? race.dem / Math.max(race.dem + race.rep + race.other, 0.0001) : null, race?.leaderParty ?? null, Boolean(race))
            }}
            selected={pin}
            onSelect={setPin}
            detail={detail}
          />
          <p className="panel__note">深色是今年不改选的州。颜色按领先一方的胜率：越深越稳，浅紫是五五开。</p>
        </article>
      </div>

      <section className="govband" aria-label="州长选举">
        <header>
          <h2>州长选举 · 36 州</h2>
          <p>底色和字母是该州州长市场的领先方。D 民主党，R 共和党。</p>
        </header>
        <div className="govgrid">
          {GOVERNOR_STATES.map((abbr) => {
            const meta = STATE_BY_ABBR[abbr]
            const race = governors.get(abbr)
            const fill = chanceFill(
              race ? race.dem / Math.max(race.dem + race.rep + race.other, 0.0001) : null,
              race?.leaderParty ?? null,
              Boolean(race),
            )
            return (
              <button
                key={abbr}
                type="button"
                className="govcell"
                style={{ background: fill, color: inkOn(fill) }}
                onClick={() => setPin(abbr)}
              >
                <b>{abbr}</b>
                <span>{meta?.zh}</span>
                <small>{race ? `${race.leaderParty} ${pct(race.leaderPrice)}%` : '—'}</small>
              </button>
            )
          })}
        </div>
      </section>

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

function Spotlight({
  abbr,
  early,
  senate,
}: {
  abbr: string
  early: EarlyState | undefined
  senate: Race | undefined
}) {
  const meta = STATE_BY_ABBR[abbr]
  const voted = early?.voted ?? 0
  const known = (early?.dem ?? 0) + (early?.rep ?? 0) > 0
  return (
    <article className="spot">
      <header>
        <h3>{meta?.zh ?? abbr}</h3>
        <span>{abbr}</span>
      </header>
      <p>提前已投</p>
      <strong>{voted > 0 ? formatInt(voted) : '—'}</strong>
      {known && early ? (
        <>
          <div className="spot__shares">
            <span>民主党 {pct(share(early.dem, voted))}%</span>
            <span>共和党 {pct(share(early.rep, voted))}%</span>
          </div>
          <div className="split thin" aria-hidden="true">
            <i style={{ width: `${share(early.dem, voted) * 100}%` }} />
            <i className="is-rep" style={{ width: `${share(early.rep, voted) * 100}%` }} />
            <i className="is-other" style={{ width: `${share(early.unaffiliated, voted) * 100}%` }} />
          </div>
          <small>百分比含未表明党籍的票，所以两边加总不到 100。</small>
        </>
      ) : (
        <small>这个州的汇总里没有党籍拆分。</small>
      )}
      {senate ? (
        <p className="spot__race">
          参议院 {senate.leaderName}
          <b>
            {pct(senate.leaderPrice)}% {partyLabel(senate.leaderParty)}
          </b>
        </p>
      ) : (
        <p className="spot__race">今年没有参议员改选</p>
      )}
    </article>
  )
}

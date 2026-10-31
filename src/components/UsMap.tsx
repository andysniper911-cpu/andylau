import { useState } from 'react'
import { NORTHEAST_CALLOUTS, STATE_BY_ABBR } from '../data/states.ts'
import { MAP_HEIGHT, MAP_WIDTH, STATE_PATHS } from '../geo/statePaths.ts'
import { inkOn } from '../lib/derive.ts'

export type MapDetail = {
  title: string
  lines: string[]
}

type UsMapProps = {
  fill: (abbr: string) => string
  selected?: string | null
  onSelect?: (abbr: string) => void
  detail?: (abbr: string) => MapDetail | null
  showCallouts?: boolean
}

export function UsMap({ fill, selected, onSelect, detail, showCallouts = true }: UsMapProps) {
  const [hover, setHover] = useState<string | null>(null)
  const [point, setPoint] = useState({ x: 12, y: 12 })
  const active = hover
  const info = active && detail ? detail(active) : null

  return (
    <div
      className="map-frame"
      onMouseLeave={() => setHover(null)}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        setPoint({
          x: event.clientX - bounds.left + 14,
          y: event.clientY - bounds.top + 14,
        })
      }}
    >
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="美国各州地图">
        {STATE_PATHS.map((state) => (
          <path
            key={state.abbr}
            d={state.d}
            fill={fill(state.abbr)}
            className={selected === state.abbr ? 'is-selected' : undefined}
            onMouseEnter={() => setHover(state.abbr)}
            onClick={() => onSelect?.(state.abbr)}
          >
            <title>{STATE_BY_ABBR[state.abbr]?.zh ?? state.abbr}</title>
          </path>
        ))}
      </svg>
      {showCallouts ? (
        <ol className="map-callouts">
          {NORTHEAST_CALLOUTS.map((abbr) => (
            <li key={abbr}>
              <button
                type="button"
                style={{ background: fill(abbr), color: inkOn(fill(abbr)) }}
                aria-label={STATE_BY_ABBR[abbr]?.zh ?? abbr}
                onClick={() => onSelect?.(abbr)}
              >
                {abbr}
              </button>
            </li>
          ))}
        </ol>
      ) : null}
      {info ? (
        <div className="map-tip" style={{ left: point.x, top: point.y }}>
          <strong>{info.title}</strong>
          {info.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

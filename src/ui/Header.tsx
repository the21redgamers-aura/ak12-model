import { WEAPON } from '../data/weapon'

export function Header() {
  return (
    <header className="pointer-events-none flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="hud-label">R6 Siege // Field Breakdown</p>
        <h1 className="mt-1 text-4xl leading-none font-bold tracking-wide text-ink md:text-5xl">
          {WEAPON.name}
          <span className="ml-3 align-middle font-mono text-xs font-normal tracking-[0.25em] text-accent">
            {WEAPON.class.toUpperCase()}
          </span>
        </h1>
        <p className="mt-1 font-mono text-[11px] text-muted">
          Operators: {WEAPON.operators.join(' · ')}
        </p>
      </div>

      <dl className="hud-panel pointer-events-auto hidden grid-cols-4 gap-x-6 px-5 py-3 md:grid">
        {WEAPON.stats.map((stat) => (
          <div key={stat.label}>
            <dt className="hud-label">{stat.label}</dt>
            <dd className="mt-0.5 text-lg font-bold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}

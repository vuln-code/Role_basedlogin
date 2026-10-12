import type { LucideIcon } from 'lucide-react'

// Adapted from the card/header/content/detail-row composition in
// 21st.dev Statistics Card 10 by sean0205 (demo 4245).
// https://21st.dev/@sean0205/components/statistics-card-10
// The catalog demo used mock revenue and inert actions; this version accepts
// only the real, role-scoped values supplied by each dashboard.
export interface InsightDetail {
  label: string
  value: string
  share?: number
}

export function DashboardInsight({
  title,
  eyebrow,
  value,
  description,
  icon: Icon,
  details,
}: {
  title: string
  eyebrow: string
  value: string | number
  description: string
  icon: LucideIcon
  details: InsightDetail[]
}) {
  return (
    <section className="dashboard-insight" aria-label={title}>
      <div className="dashboard-insight-main">
        <div className="dashboard-insight-heading">
          <span className="dashboard-insight-icon"><Icon size={21} aria-hidden="true" /></span>
          <span className="dashboard-insight-eyebrow">{eyebrow}</span>
        </div>
        <h2>{title}</h2>
        <div className="dashboard-insight-value">{value}</div>
        <p>{description}</p>
      </div>
      <div className="dashboard-insight-details">
        {details.map(({ label, value: detailValue, share }) => (
          <div className="dashboard-insight-row" key={label}>
            <div className="dashboard-insight-row-text">
              <span>{label}</span>
              <strong>{detailValue}</strong>
            </div>
            {share !== undefined && (
              <div className="dashboard-insight-track" aria-hidden="true">
                <span style={{ width: `${Math.max(0, Math.min(100, share))}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

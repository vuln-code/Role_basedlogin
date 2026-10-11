import { ShieldCheck } from 'lucide-react'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark" aria-label="AccessFlow">
      <span className="brand-icon" aria-hidden="true">
        <ShieldCheck size={compact ? 17 : 21} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span>
          <strong>Access</strong>Flow
        </span>
      )}
    </div>
  )
}

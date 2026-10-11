// Adapted from Arunachalam's Modern Animated Sign In, 21st.dev demo 2034.
// https://21st.dev/@arunachalam/components/modern-animated-sign-in
// Source recovered from this project's successful MCP retrieval on 2026-10-12.
// Ported Motion's reveal/hover effects to CSS for Vite; no Next.js or remote assets.
import { memo, type CSSProperties, type ReactNode } from 'react'
import { Fingerprint, Layers3, ShieldCheck, Users, Workflow } from 'lucide-react'
import './modern-animated-sign-in.css'

export const BoxReveal = memo(function BoxReveal({ children }: { children: ReactNode }) {
  return <div className="af-box-reveal"><div>{children}</div><span aria-hidden="true" /></div>
})

export const Ripple = memo(function Ripple() {
  return (
    <div className="af-ripple" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} style={{
          width: 210 + i * 70,
          height: 210 + i * 70,
          opacity: Math.max(0.04, 0.24 - i * 0.03),
          animationDelay: `${i * 0.06}s`,
          borderStyle: i === 7 ? 'dashed' : 'solid',
        }} />
      ))}
    </div>
  )
})

export const OrbitingCircles = memo(function OrbitingCircles({
  children, radius = 150, duration = 30, delay = 0, reverse = false, path = true,
}: {
  children: ReactNode; radius?: number; duration?: number; delay?: number;
  reverse?: boolean; path?: boolean;
}) {
  return <>
    {path && <svg className="af-orbit-path" aria-hidden="true"><circle cx="50%" cy="50%" r={radius} fill="none" /></svg>}
    <div className="af-orbit-icon" style={{
      '--radius': `${radius}px`, '--duration': `${duration}s`,
      animationDelay: `${-delay}s`, animationDirection: reverse ? 'reverse' : 'normal',
    } as CSSProperties}>{children}</div>
  </>
})

export function TechOrbitDisplay() {
  return (
    <div className="af-orbit-display" aria-hidden="true">
      <Ripple />
      <div className="af-orbit-core"><Fingerprint size={52} strokeWidth={1.2} /></div>
      <OrbitingCircles><Users size={23} /></OrbitingCircles>
      <OrbitingCircles delay={15} path={false}><ShieldCheck size={23} /></OrbitingCircles>
      <OrbitingCircles radius={235} duration={45} reverse><Layers3 size={23} /></OrbitingCircles>
      <OrbitingCircles radius={235} duration={45} delay={22.5} reverse path={false}><Workflow size={23} /></OrbitingCircles>
      <span className="af-orbit-caption">ONE ACCOUNT. YOUR WORKSPACE.</span>
    </div>
  )
}

export function BottomGradient() {
  return <span className="af-bottom-gradient" aria-hidden="true" />
}

export function AnimatedInputShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`af-input-glow ${className}`} onPointerMove={(event) => {
      const rect = event.currentTarget.getBoundingClientRect()
      event.currentTarget.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
      event.currentTarget.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
    }}>{children}</div>
  )
}

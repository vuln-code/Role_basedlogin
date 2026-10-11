import { BrandMark } from './BrandMark'

export function LoadingScreen() {
  return (
    <main className="loading-screen" aria-live="polite" aria-busy="true">
      <div className="loading-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <BrandMark />
      <p>Verifying your secure workspace…</p>
    </main>
  )
}

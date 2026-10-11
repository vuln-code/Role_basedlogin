import { ExternalLink, KeyRound, ServerCog } from 'lucide-react'
import { BrandMark } from './BrandMark'

export function SetupNotice() {
  return (
    <main className="setup-page">
      <section className="setup-card">
        <BrandMark />
        <span className="eyebrow">One-time setup required</span>
        <h1>Connect your Supabase project</h1>
        <p>
          The interface is ready, but authentication stays disabled until the two public
          browser variables are configured. No mock login is used.
        </p>
        <ol className="setup-steps">
          <li>
            <ServerCog aria-hidden="true" />
            Run <code>supabase/schema.sql</code> in the Supabase SQL Editor.
          </li>
          <li>
            <KeyRound aria-hidden="true" />
            Copy <code>.env.example</code> to <code>.env.local</code> and add the project URL
            and publishable key.
          </li>
          <li>
            <ExternalLink aria-hidden="true" />
            Restart <code>npm run dev</code> after saving the environment file.
          </li>
        </ol>
        <p className="setup-footnote">See README.md for the complete account and role setup.</p>
      </section>
    </main>
  )
}

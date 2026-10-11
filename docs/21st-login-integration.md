# 21st.dev login integration

Source: [Modern Animated Sign In by Arunachalam](https://21st.dev/@arunachalam/components/modern-animated-sign-in), demo ID 2034.

The original component source was retrieved successfully through the connected 21st.dev MCP earlier in this project's session. This integration reuses that locally recorded source; it does not require another retrieval, a paid subscription, or a 21st.dev runtime API key.

The adapted primitives live in `src/components/ui/modern-animated-sign-in.tsx` and its adjacent CSS file. The original ripple circle generation, orbit path/rotation structure, reveal effect, cursor-following radial input glow, and button gradient are adapted for the existing Vite app. Motion-based effects are implemented with CSS; Next.js image imports and demo-only social-login controls are omitted. Icons are provided by the project's existing Lucide dependency.

`src/components/Login.tsx` mounts these primitives around the existing controlled inputs and authentication handlers. Login, forgot-password, validation, loading, and success/error messages continue to use the existing AuthContext. Authentication, recovery routing, dashboards, database schema, and RLS files are unchanged by this integration.

The new styles are scoped under `af-` classes. Reduced-motion preferences disable the decorative animations. On narrow screens the illustration is hidden and the login form fills the screen.

Verification: TypeScript production build and all 11 existing unit tests pass. Browser smoke checks cover desktop/mobile layout, empty-field validation, password visibility, mocked invalid-login and recovery-email responses, back navigation, reduced motion, and the invalid recovery route. Live account credentials and email delivery require verification with the configured Supabase project.

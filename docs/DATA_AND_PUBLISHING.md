# Content, media and publishing

## Source of truth

`createSeed()` migrates the V2 case studies and reconciles the resume supplied on 20 October 2026. The public resume is the unchanged supplied PDF (129159 bytes). The new document records BOA XR R&D work (September–October 2026), the FORCRUX frontend engagement (May–July 2026), and CGPA 7.99. Dates not supplied by the sources remain absent. The personal Punch Hero restoration study explicitly remains in progress; no APK or fabricated success result is linked. Unsupported old role/metrics claims were removed from the current presentation while V2 remains in Git.

## Document contract

A schemaVersion 3 document contains `profile`, `records`, `nodes`, `edges`, and `settings.layouts`. Records have stable IDs and unique slugs, a content type, publication state, ordering, sections, tags, links, media and related IDs. Typed optional fields cover experience dates/current role/employment, qualifications, project role/status, and skills. Nodes reference records and worlds; they carry parent IDs, automatic/manual placement, bounded size/color/material/geometry, label and animation settings. Edges connect distinct existing nodes in one world. Import supports a version-2 envelope and rejects unsupported versions.

Validation rejects duplicate IDs/slugs, parent cycles, broken relations, cross-world edges, nonfinite/oversized positions, malformed dates, unsupported presets, dangerous keys, executable values, and unsafe URLs. Public filtering removes draft/archived content, hidden nodes and orphaned relations before rendering. The public application renders content as text, not executable HTML.

## Browser development workspace

With `npm run dev` and no Supabase configuration, drafts, local publications and the last 30 versions live in localStorage. Each successful publication saves a recoverable version. Media bytes live in IndexedDB `portfolio-v3-media`, separately from the document; stable `local-media:` references survive reload in the same browser. Images, videos and PDFs up to 20 MB are supported. Object URLs are created only while viewing media and revoked during cleanup. Local publication is explicitly a preview; it does not update the hosted site or another browser.

Exported JSON contains content and media references, not binary files. Keep original uploaded files separately; changing browser/profile or clearing site data removes local media. Use remote storage URLs for portable backups. Importing a backup is a draft operation and does not publish automatically. A production build without a backend disables editing and publishing and ignores browser-local public snapshots.

## Supabase setup (external configuration required)

1. Create a dedicated Supabase project. Run `supabase/migrations/202610200001_portfolio.sql` in its SQL editor once.
2. Create the owner's email/password account using Supabase Authentication. Disable public signup if not needed. Add only its user UUID using a privileged SQL session: `insert into public.portfolio_owners(user_id) values ('OWNER-USER-UUID');`. The browser cannot add owner membership.
3. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the build environment. The second value is a **publishable/anon key**, never a secret or service-role key. The client refuses known secret-key forms. No backend secrets belong in Vite variables.
4. Rebuild/deploy. Open `#/admin`, sign in, edit and save. Publish only after validation/confirmation. Open a separate unauthenticated browser and verify the latest public snapshot.
5. Verify anonymous/non-owner writes fail, drafts/history remain private, uploaded media opens, owner logout clears editing access, and restore/publish rollback works.

The schema uses owner-only RLS for drafts/history/writes, public read access only to `portfolio_public`, and an atomic `publish_portfolio` RPC. Anonymous clients cannot invoke the publish function. Uploaded portfolio media is deliberately public; never upload confidential documents. Storage paths include the owner's UUID, with a 20 MB limit and a MIME allowlist. Cloud publishing refuses browser-local media references; re-upload them to the configured cloud store first.

Authentication tokens stay in memory. Reload requires signing in again; the database draft survives. Failed/expired sessions are cleared. Failed live reads use the bundled valid seed with a visible notice. Unsuccessful publication does not replace the in-memory public snapshot.

## Verification boundary

Unit tests use mocked HTTP responses to verify request structure, authorization rejection, session clearing, public/draft separation and rollback behavior. They do **not** prove a deployed Supabase instance or SQL policies work. No Supabase credentials/project were supplied, so live authentication, RLS enforcement, storage and cross-device publication remain unverified until the above setup and acceptance steps are performed.

On 26 October 2026 the owner confirmed there is no Supabase project yet and requested documented setup. Cloud activation is intentionally deferred; no account is created automatically.

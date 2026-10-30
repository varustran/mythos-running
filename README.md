# Mythos Running

A production-grade, multilingual website for runners: training academy, 15 working calculators, race calendar, Hue running routes, gear reviews, community, and Mythos Labs experiments.

Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, i18next, next-themes, and Supabase.

## Highlights

- **Four locales** — Vietnamese (default), English, Simplified Chinese, Japanese — with locale-prefixed routes, hreflang alternates, and a persisted language preference.
- **15 calculators** — pace, race prediction, splits, heart-rate zones, VDOT, cadence, fueling, hydration, shoe rotation, and more. All compute locally, with copy-to-clipboard results.
- **Content system** — Academy articles, events, routes, gear reviews, and Labs projects rendered from typed data with Markdown support, tables of contents, share links, and JSON-LD.
- **Dark / light / system themes** with no flash of incorrect theme.
- **SEO** — per-page metadata, Open Graph/Twitter cards, JSON-LD (Organization, WebSite, Article, BreadcrumbList, TouristAttraction), sitemap, robots, web manifest.
- **Supabase (optional)** — GitHub OAuth and magic-link sign-in, role-based admin, contact inbox, newsletter subscribers.
- **Honest content** — sample events are clearly labeled, excluded from the sitemap, and marked `noIndex`; no invented testimonials or results.

## Getting started

```bash
npm install
cp .env.example .env.local   # PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000 — you will be redirected to `/vi` (or your browser language).

The public site works without any environment variables. Authentication, `/admin`, the contact form, and the newsletter require Supabase.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | Alias for the type check (no separate ESLint config) |

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL used by metadata, sitemap, and auth redirects. Defaults to `http://localhost:3000`. |
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/admin | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/admin | Supabase anon (public) key. |

Never expose the Supabase service-role key to the browser.

## Supabase setup

1. Create a project at https://supabase.com.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. Enable **GitHub** under Authentication → Providers and add your callback URL: `https://YOUR_DOMAIN/auth/callback`.
4. Add the same URL under Authentication → URL Configuration → Redirect URLs (include `http://localhost:3000/auth/callback` for local development).
5. Sign in once, then promote your account:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Roles: `admin` and `editor` can open `/admin`; `reader` is a normal member.

### Schema

- `profiles` — one row per auth user, created by an `auth.users` trigger; RLS restricts reads to self/admins and writes to admins.
- `community_members` — public view exposing only display name, role, and join date.
- `articles`, `events`, `routes` — CMS-ready content tables (the site currently renders typed repository content).
- `contact_messages` — public insert, admin read/update/delete.
- `newsletter_subscribers` — public insert, admin read/delete.

## Project structure

```
app/
  [locale]/            locale-scoped routes (home, academy, tools, events, routes,
                       gear, community, labs, legal, about, contact, login, admin)
  api/                 newsletter + contact handlers
  auth/callback/       OAuth / magic-link exchange
  sitemap.ts robots.ts manifest.ts
components/
  layout/ brand/ content/ tools/ auth/ ui/ providers/
data/                  typed content (articles, events, routes, gear, labs, legal, about)
lib/
  i18n/                locale settings, dictionaries, server + client helpers
  supabase/            browser, server, middleware clients
  tools/               tool catalog and calculator functions
supabase/migrations/   database schema + RLS
```

Content lives in `data/*.ts` and is statically rendered. The admin content pages are read-only views of that data; `admin.seedContentNote` explains this in the UI.

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
vercel --prod
```

Or import the repository at https://vercel.com/new. Add the environment variables above in Project Settings → Environment Variables, then redeploy.

### Any Node host

```bash
npm ci
npm run build
npm run start
```

The app requires Node 18.18+ (Node 20+ recommended).

## Editorial policy

- Calculators are educational estimates, not medical advice.
- Sample events are demonstration data and are never presented as real races.
- Route descriptions are editorial guidance; runners are responsible for checking conditions, access, and safety.
- Gear reviews state their basis and avoid fabricated testing data.

See `/editorial-policy`, `/disclaimer`, `/privacy`, and `/terms` for the published versions.

# Supabase + Vercel setup

## Supabase

1. Create a Supabase project.
2. In the Supabase SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Providers**, enable Email.
4. In **Authentication → URL Configuration**, set the production Site URL to your Vercel URL and add the Vercel URL to Redirect URLs.
5. Copy the project URL and public anon key from **Project Settings → API**.

## Vercel

Import this repository into Vercel. The repository includes `vercel.json`, which runs `pnpm build:web`, serves `dist/public`, and rewrites SPA routes to `index.html`.

Add these Vercel environment variables for Production, Preview, and Development:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

The anon key is safe for browser use when Row Level Security is enabled. Never add a Supabase service-role key to `VITE_` variables or frontend code.

## Local verification

```bash
pnpm install
pnpm build:web
```

After setting the two variables, test sign-up, email confirmation, sign-in, sign-out, task creation, task completion, refresh persistence, and account isolation on the Vercel preview URL.

# Joseph Group PTWA (Permit to Work Application)

Phase 2: cloud-synced via Supabase (Postgres + Storage + Auth). Permits now sync across every device instantly — raise a permit on one phone, see it on another.

## What's included
- Login (HSE password: `2526`) — backed by a real Supabase Auth session
- Home (New Permit / Register / Dashboard)
- New Permit form — matches your original PTW Application form + Register fields
- Race-safe auto permit numbering: `JG-HSE-PTW-001`, sequential, safe even if two people submit at once
- Hazard & Controls dropdown library, pre-built per permit type
- PPE checklist, real file attachments (compressed images) stored in Supabase Storage
- PTW Register — search, filter, sort, CSV export, print — live across all devices
- Dashboard — status counts, today/week/month, permits by type
- Permit detail — view, edit, print/save as PDF, close-out workflow
- Back button (in-app + hardware back), refresh button, hamburger menu
- Rebranded to the real Joseph Group logo and colors
- PWA-ready (installable, offline-capable shell)

## One-time Supabase setup

### 1. Create the project
Go to [supabase.com](https://supabase.com) → New project. Pick any name/region, save the database password somewhere safe (you won't need it day-to-day).

### 2. Run the schema
Project → **SQL Editor** → New query → paste the entire contents of `supabase/schema.sql` from this folder → **Run**.

This creates:
- `permits` table (every field from your form + Register)
- `permit_attachments` table (file metadata)
- `permit_counter` + `next_permit_no()` for safe sequential numbering
- Row Level Security policies (only a signed-in HSE session can read/write)
- The `ptw-attachments` Storage bucket + its access policies

### 3. Create the single HSE login
Project → **Authentication** → **Users** → **Add user** → **Create new user**:
- Email: `hse@josephgroup.app`
- Password: `2526`
- Toggle **Auto Confirm User** on, then create.

This is the one account the app signs in with when someone types `2526` on the login screen.

### 4. Get your API credentials
Project → **Settings** → **API**. Copy:
- **Project URL**
- **anon public** key

### 5. Set environment variables
**Local development:** copy `.env.example` to `.env` and paste in the two values.

**Netlify:** Site settings → **Environment variables** → add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then redeploy (Netlify → Deploys → Trigger deploy) so the build picks them up.

## Run locally
```bash
npm install
npm run dev
```

## Deploy (GitHub + Netlify)
1. Push this folder to a GitHub repository.
2. Netlify → "Add new site" → "Import an existing project" → pick the repo.
3. Build command: `npm run build` — Publish directory: `dist` (already set in `netlify.toml`).
4. Add the two environment variables from step 5 above before the first deploy.
5. Deploy. Add the live URL to your phone's home screen to use it like an app.

## Changing the HSE password later
Update the password on the `hse@josephgroup.app` user in Supabase → Authentication → Users. The app's login screen doesn't need any code change — it always signs in with whatever password is typed against that one account.

## Notes
- Attachments over a few MB may take a moment to upload on a slow connection — images are compressed client-side first (JPEG, quality 0.6) to keep this fast.
- Signatures are typed-name only, per your instruction.
- If the Register/Dashboard ever show a red error banner, it almost always means the Netlify environment variables aren't set, or the SQL schema hasn't been run yet.

# Joseph Group HSE Portal — merged app

This folder combines your three separate apps into one:

- **Joseph Group HSE Inspections** (the 11-module React app)
- **JGM Site Safety** (ADNOC / ENOC / EMARAT / CIVIL)
- **JA Installation** (site safety inspections)

...behind **one PIN login** and **one dashboard** with a tile for each app.
All three save their data into **one new Supabase project** that you'll
create fresh — nothing here is connected to any of your old accounts.

---

## What actually changed under the hood

Nothing about how any of the three apps *work* has changed — every screen,
form, checklist and report is exactly what it was before. What changed is
only **where the data is saved**: all three now write into one shared
Supabase table called `kv_store`, each using its own prefix (`jg:`, `jgm:`,
`ja:`) so their data can never collide.

A new front page (`portal-index.html`) asks for a single 4-digit PIN, then
shows one dashboard with three tiles — tapping a tile opens that app.

---

## Setup — 4 steps

### Step 1: Create the new Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick a name (e.g. `joseph-group-hse-portal`), a password, and a region
   close to the UAE (e.g. Frankfurt or Mumbai). Click **Create**. Takes
   about a minute to spin up.
3. Once it's ready, go to **Project Settings → API**. You'll need two
   values from this page in Step 2:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (a long string starting with `sb_publishable_` or `eyJ...`)

### Step 2: Paste your new credentials into 3 files

Each of the three apps has its own copy of the Supabase URL and key
(this is intentional — it keeps each app independent). Open each file
below and replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with
the real values from Step 1:

- `joseph-group-app/src/lib/storageShim.js` (near the top)
- `jgm/index.html` (search for `SUPABASE_URL`)
- `ja-installation/index.html` (search for `SUPABASE_URL`)

Each file has two lines that look like this:

```js
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

Just replace the placeholder text between the quotes — keep the quotes.

### Step 3: Run the SQL in Supabase (2 minutes)

1. In your new Supabase project, open **SQL Editor → New query**.
2. Open `supabase_setup.sql` from this folder, copy all of it, paste it
   in, click **Run**.
3. This creates the shared `kv_store` table all three apps write into.
   Since it's a brand new project, there's no old data to migrate.

### Step 4: Push to a new GitHub repo and deploy on Netlify

1. Create a new GitHub repo (e.g. `7akatsuki/joseph-group-hse-portal`) and
   push this whole `merged` folder to it.
2. In Netlify: **Add new site → Import an existing project** → pick the
   new repo.
3. Netlify auto-detects the build settings from `netlify.toml` — you
   don't need to type anything in manually.
4. Click **Deploy**. Netlify will:
   - Install and build the Joseph Group React app
   - Copy JGM and JA Installation's files in as-is
   - Combine everything into one site with the portal as the homepage

That's it — one URL, one PIN, three apps, one fresh database.

---

## Changing the portal PIN

Open `portal-index.html`, find this line near the bottom:

```js
const PORTAL_PIN = "2526"; // Change this any time — see README for how.
```

Change `"2526"` to whatever 4-digit PIN you want, save, and push to GitHub —
Netlify redeploys automatically.

Note: this PIN only gates the **portal's front door**. Once inside, each
app still has its own internal login as before — the Joseph Group app's
fixed PIN (`8080`), and JGM/JA's per-person HSE PINs and Team Leader mobile
number sign-in. I left those exactly as they were rather than merging them,
since they use different identity models (a single shared PIN vs. named
individuals vs. mobile-number self-registration) — merging those into a
single sign-on would mean redesigning how each app recognizes its users.
Happy to tackle that as a next step if you'd like everyone to have just one
login across the board.

---

## Testing locally before deploying (optional)

You'll need Node.js installed.

```bash
bash build.sh
```

This builds everything into a `publish/` folder. Open it with a local
server (e.g. `npx serve publish`) to preview the whole portal — the Joseph
Group app's routing needs to be served properly, not opened as a plain file.

---

## Folder structure

```
merged/
├── portal-index.html      ← the one login + dashboard (becomes the site's homepage)
├── portal-manifest.json
├── netlify.toml            ← tells Netlify how to build everything
├── build.sh                 ← the build script Netlify runs automatically
├── supabase_setup.sql       ← run once in your new Supabase project
├── joseph-group-app/        ← React source for the 11 inspection modules
├── jgm/                      ← JGM Site Safety (static, unchanged except storage prefix)
└── ja-installation/          ← JA Installation (static, unchanged except storage backend)
```

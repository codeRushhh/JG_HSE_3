# Joseph Group HSE Portal — merged app

This combines FOUR apps into one:

- **Joseph Group HSE Inspections** (11-module React app)
- **JGM** (Joseph General Maintenance — site safety inspections)
- **JPTS** (Joseph Projects & Traffic Signs — site safety inspections)
- **PTW** (Permit to Work app)

...behind one tap-to-enter cover page and **one dashboard** with a tile for
each app — all four sharing **ONE Supabase database**: your existing PTWA
project.

---

## ⭐ You only need to edit ONE file: `credentials.txt`

Every other file in this project is already finished. Just:

1. Open `credentials.txt` (double-click, opens in Notepad)
2. Paste in your **existing PTWA Supabase project's** URL and anon key
3. Save
4. Push to GitHub → deploy on Netlify

The build process reads `credentials.txt` and wires all four apps to that
one database automatically.

---

## Step 1: Get your existing PTWA Supabase credentials

1. Go to **supabase.com** and log in
2. Open the Supabase project your **live PTWA app** already uses
3. Click the **gear icon (Settings)** on the left sidebar → **API**
4. Copy the **Project URL**
5. Copy the **anon public** key

---

## Step 2: Edit `credentials.txt`

1. Double-click `credentials.txt` in this folder
2. Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with the two
   values from Step 1 (no quote marks, no spaces)
3. Save and close

That's the only editing you'll do.

---

## Step 3: Run the SQL (adds one new table, doesn't touch PTWA's data)

1. In that same Supabase project, click **SQL Editor** → **New query**
2. Open `supabase_setup.sql` from this folder, select all, copy it
3. Paste into the Supabase SQL box, click **Run**

This script only **adds** one new table (`kv_store`) that Joseph Group
Inspections, JGM, and JPTS will use. Every statement for PTWA's existing
tables uses "if not exists" / "on conflict do nothing", so your existing
PTWA data is completely untouched — this is safe to run even though those
tables are already there.

---

## Step 4: Push to GitHub, deploy on Netlify

1. Push the whole `merged` folder to a new GitHub repo
2. In Netlify: **Add new site → Import an existing project** → pick the repo
3. Don't change any build settings — `netlify.toml` is already configured
4. Click **Deploy site**
5. Netlify builds both React apps (Joseph Group Inspections and PTWA),
   copies JGM and JPTS in as static apps, and wires all four to your one
   Supabase project using `credentials.txt`

You'll get a link like `something.netlify.app`. Open it:
- Tap the Joseph Group logo to enter (no PIN)
- You'll see a dashboard with 4 tiles: Joseph Group Inspections, JGM, JPTS, PTW
- Each app has a "← Back to Portal" link so you can always get back

**If the build fails**, check the Netlify build log — if `credentials.txt`
still has placeholder text, the build stops with a clear message instead of
deploying a broken site.

---

## What changed from the previous version

- Cover page no longer asks for a PIN — tap the Joseph Group logo to continue
- Each tile now shows a real company logo (Joseph Group, JGM, JPTS)
- JGM and JPTS renamed to match their real company names
- Every app now has a way back to the portal
- PTW (Permit to Work) added as a 4th tile
- **All four apps now share ONE Supabase database** — your existing PTWA
  project — instead of PTWA having its own separate one

---

## Folder structure

```
merged/
├── credentials.txt          ← ⭐ the ONLY file you edit
├── portal-index.html        ← cover page + dashboard (logo tap-to-enter)
├── portal-manifest.json
├── joseph-group-logo.png / jgm-logo.png / jpts-logo.png
├── netlify.toml               ← tells Netlify how to build everything
├── build.sh                    ← runs automatically, reads credentials.txt
├── supabase_setup.sql           ← run once in your PTWA Supabase project
├── joseph-group-app/            ← React source, credentials filled automatically
├── ptwa-app/                    ← PTWA React source, credentials filled automatically
├── jgm/                          ← JGM, credentials filled automatically
└── ja-installation/              ← JPTS, credentials filled automatically
```

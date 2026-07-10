# Joseph Group HSE Portal — merged app

This combines your three apps into one:

- **Joseph Group HSE Inspections** (11-module React app)
- **JGM Site Safety** (ADNOC / ENOC / EMARAT / CIVIL)
- **JA Installation** (site safety inspections)

...behind **one PIN login** and **one dashboard** with a tile for each app,
all saving into **one new Supabase project** you'll create.

---

## ⭐ You only need to edit ONE file: `credentials.txt`

Every other file in this project is already finished — you never need to
open, edit, or rename any `.js` or `.html` file. Just:

1. Create a new Supabase project (Step 1 below)
2. Open `credentials.txt` in Notepad (it's a normal text file, opens fine)
3. Paste in your two values
4. Save it
5. Push everything to GitHub → deploy on Netlify

The build process reads `credentials.txt` automatically and fills the
values into all three apps for you.

---

## Step 1: Create the new Supabase project

1. Go to **supabase.com** → sign up / log in → **New project**
2. Name it anything (e.g. `joseph-group-hse-portal`), set a password, pick
   a region close to the UAE
3. Click **Create new project** and wait ~1-2 minutes

Then get your two values:

1. Click the **gear icon (Settings)** on the left sidebar
2. Click **API**
3. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
4. Copy the **anon public** key (a long string)

---

## Step 2: Edit `credentials.txt`

1. In the unzipped folder, double-click `credentials.txt` — it opens in
   Notepad normally (it's a real `.txt` file, no tricks needed)
2. You'll see:
   ```
   SUPABASE_URL=YOUR_SUPABASE_URL
   SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```
3. Replace `YOUR_SUPABASE_URL` with the Project URL you copied (no quote
   marks, no spaces)
4. Replace `YOUR_SUPABASE_ANON_KEY` with the anon public key you copied
5. Save (Ctrl+S) and close Notepad

That's the only editing you'll ever do. Everything else is already built.

---

## Step 3: Set up the database table

1. In Supabase, click **SQL Editor** → **New query**
2. Open `supabase_setup.sql` from the folder, select all, copy it
3. Paste into the Supabase SQL box, click **Run**
4. You should see a "Success" message

---

## Step 4: Push to GitHub

1. Create a new GitHub repo (e.g. `joseph-group-hse-portal`)
2. Push this whole `merged` folder to it (including `credentials.txt` with
   your real values — this is fine to commit; Supabase's "anon public" key
   is designed to be safely visible in client-side code)

---

## Step 5: Deploy on Netlify

1. Go to **netlify.com** → **Add new site** → **Import an existing project**
2. Pick your new GitHub repo
3. Don't change any build settings — `netlify.toml` already has everything
   configured
4. Click **Deploy site**
5. Wait a minute or two — Netlify will read `credentials.txt` automatically
   during the build and wire up all three apps
6. You'll get a link like `something.netlify.app` — open it

You should see one PIN login (default `2526`), then a dashboard with 3 tiles.

**If the build fails**, check the Netlify build log — if `credentials.txt`
still has placeholder text in it, the build will stop and tell you exactly
that, rather than deploying a broken site.

---

## Changing the portal PIN

Open `portal-index.html` (this one you're welcome to edit — it's plain
HTML), find:

```js
const PORTAL_PIN = "2526";
```

Change the number, save, push to GitHub. Netlify redeploys automatically.

Each app underneath still keeps its own original login too — the Joseph
Group app's fixed PIN (`8080`), and JGM/JA's per-person HSE PINs and Team
Leader mobile sign-in. The portal PIN is just the new front door on top.

---

## Folder structure

```
merged/
├── credentials.txt          ← ⭐ the ONLY file you edit
├── portal-index.html        ← the login + dashboard homepage (PIN is here)
├── portal-manifest.json
├── netlify.toml               ← tells Netlify how to build everything
├── build.sh                    ← runs automatically, reads credentials.txt
├── supabase_setup.sql          ← run once in your new Supabase project
├── joseph-group-app/           ← React source, credentials filled automatically
├── jgm/                         ← JGM Site Safety, credentials filled automatically
└── ja-installation/             ← JA Installation, credentials filled automatically
```

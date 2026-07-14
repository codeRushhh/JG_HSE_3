#!/usr/bin/env bash
# Builds the merged Joseph Group HSE Portal for deployment.
# Netlify runs this automatically (see netlify.toml). You should not need
# to run this yourself unless you're testing a build locally.
set -e

# ---- Read credentials.txt (one shared pair, used by all four apps) ----
SUPABASE_URL=$(grep '^SUPABASE_URL=' credentials.txt | cut -d'=' -f2- | tr -d '\r')
SUPABASE_ANON_KEY=$(grep '^SUPABASE_ANON_KEY=' credentials.txt | cut -d'=' -f2- | tr -d '\r')

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "YOUR_SUPABASE_URL" ] || \
   [ -z "$SUPABASE_ANON_KEY" ] || [ "$SUPABASE_ANON_KEY" = "YOUR_SUPABASE_ANON_KEY" ]; then
  echo ""
  echo "=========================================================="
  echo "BUILD STOPPED: credentials.txt still has placeholder values."
  echo "Open credentials.txt in this folder and paste your real"
  echo "Supabase Project URL and anon public key (from your existing"
  echo "PTWA project), then save and push again."
  echo "=========================================================="
  exit 1
fi

echo "==> Building Joseph Group Inspections app..."
cd joseph-group-app
echo "VITE_SUPABASE_URL=$SUPABASE_URL" > .env
echo "VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env
npm install
npm run build
cd ..

echo "==> Building PTWA (Permit to Work) app..."
cd ptwa-app
echo "VITE_SUPABASE_URL=$SUPABASE_URL" > .env
echo "VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env
npm install
npm run build
cd ..

echo "==> Assembling merged publish folder..."
rm -rf publish
mkdir -p publish

# Portal (root)
cp portal-index.html publish/index.html
cp portal-manifest.json publish/manifest.json
cp joseph-group-logo.png publish/joseph-group-logo.png
cp jgm-logo.png publish/jgm-logo.png
cp jpts-logo.png publish/jpts-logo.png
cp ja-logo.png publish/ja-logo.png

# Joseph Group Inspections (built React app — credentials already baked in via .env above)
mkdir -p publish/joseph-group
cp -r joseph-group-app/dist/* publish/joseph-group/

# PTWA / Permit to Work (built React app — credentials already baked in via .env above)
mkdir -p publish/ptwa
cp -r ptwa-app/dist/* publish/ptwa/

# JGM (static — inject credentials into the copy going to publish/)
mkdir -p publish/jgm
cp -r jgm/* publish/jgm/
sed -i.bak "s#YOUR_SUPABASE_URL#$SUPABASE_URL#g; s#YOUR_SUPABASE_ANON_KEY#$SUPABASE_ANON_KEY#g" publish/jgm/index.html
rm -f publish/jgm/index.html.bak

# JPTS / JA Installation (static — inject credentials into the copy going to publish/)
mkdir -p publish/ja-installation
cp -r ja-installation/* publish/ja-installation/
sed -i.bak "s#YOUR_SUPABASE_URL#$SUPABASE_URL#g; s#YOUR_SUPABASE_ANON_KEY#$SUPABASE_ANON_KEY#g" publish/ja-installation/index.html
rm -f publish/ja-installation/index.html.bak

echo "==> Done. Publish folder ready at ./publish"
echo "==> All four apps now share the one Supabase project from credentials.txt."

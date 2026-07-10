#!/usr/bin/env bash
# Builds the merged Joseph Group HSE Portal for deployment.
# Netlify runs this automatically (see netlify.toml). You should not need
# to run this yourself unless you're testing a build locally.
set -e

echo "==> Building Joseph Group Inspections app..."
cd joseph-group-app
npm install
npm run build
cd ..

echo "==> Assembling merged publish folder..."
rm -rf publish
mkdir -p publish

# Portal (root)
cp portal-index.html publish/index.html
cp portal-manifest.json publish/manifest.json

# Joseph Group Inspections (built React app)
mkdir -p publish/joseph-group
cp -r joseph-group-app/dist/* publish/joseph-group/

# JGM Site Safety (static, as-is)
mkdir -p publish/jgm
cp -r jgm/* publish/jgm/

# JA Installation (static, as-is)
mkdir -p publish/ja-installation
cp -r ja-installation/* publish/ja-installation/

echo "==> Done. Publish folder ready at ./publish"

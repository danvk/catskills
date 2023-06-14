#!/bin/bash

set -o errexit

source catskills/bin/activate
./make_geojson.py
./make_hikes_json.py
./patch_progress.py
./make_index.py

cd map-src
pnpm build

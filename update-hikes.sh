#!/bin/bash

set -o errexit

source catskills/bin/activate
./make_geojson.py
./make_hikes_json.py
./update_progress.py

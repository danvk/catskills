#!/usr/bin/env python
"""Update progress in index.md using log.json"""

import json
from collections import Counter

from constants import peaks
from make_geojson import extract_season
from utils import sub

winter_peaks = [
    'Slide',
    'Balsam',
    'Panther',
    'Blackhead'
]

others = ['Pisgah', 'Hayden', 'None', 'Dry Brook Ridge']
known_peaks = set(peaks).union(set(others))

assert len(peaks) == 33
assert len(winter_peaks) == 4
assert set(winter_peaks).issubset(peaks)
assert set(others).isdisjoint(set(peaks))

LOG = json.load(open('map-src/public/log.json'))

completed_peaks = Counter()
completed_nonwinter_peaks = set()
completed_winter_peaks = set()
completed_2023 = set()
for hike in LOG:
    hike_peaks = set(hike['peaks'])
    for peak in hike_peaks:
        assert peak in known_peaks, f'Unknown peak: "{peak}"'
    if extract_season(hike['date']) == 'winter':
        completed_winter_peaks.update(hike_peaks)
    else:
        completed_nonwinter_peaks.update(hike_peaks)
    if hike['date'].startswith('2023'):
        completed_2023.update(hike_peaks)
    completed_peaks.update(hike_peaks)

qualifying = set()
for peak in set(peaks).intersection(completed_peaks):
    if peak in winter_peaks:
        if peak in completed_nonwinter_peaks or completed_peaks.get(peak) >= 2:
            qualifying.add(peak)
    else:
        qualifying.add(peak)

# 3500 Club
club_html = ''
num_done = 0
num_left = 0
for peak in sorted(completed_winter_peaks.intersection(winter_peaks)):
    club_html += f'<span class="winter complete" title="{peak} (Winter)"></span>\n'
    num_done += 1
for peak in sorted(set(winter_peaks).difference(completed_winter_peaks)):
    club_html += f'<span class="winter incomplete" title="{peak} (Winter)"></span>\n'
    num_left += 1
for peak in sorted(qualifying):
    club_html += f'<span class="3500 complete" title="{peak}"></span>\n'
    num_done += 1
for peak in sorted(set(peaks).difference(qualifying)):
    num_left += 1
    club_html += f'<span class="3500 incomplete" title="{peak}"></span>\n'
num_total = num_left + num_done
club_html += f'<span class="summary">{num_done}/{num_total}</span>\n'

# Winter peaks
winter_html = ''
for peak in sorted(completed_winter_peaks):
    winter_html += f'<span class="winter complete" title="{peak}"></span>\n'
for peak in sorted(set(peaks).difference(completed_winter_peaks)):
    winter_html += f'<span class="winter incomplete" title="{peak}"></span>\n'
num_done = len([*completed_winter_peaks])
num_total = len(peaks)
winter_html += f'<span class="summary">{num_done}/{num_total}</span>\n'

# 2023
year_html = ''
for peak in sorted(completed_2023):
    year_html += f'<span class="complete" title="{peak}"></span>\n'
for peak in sorted(set(peaks).difference(completed_2023)):
    year_html += f'<span class="incomplete" title="{peak}"></span>\n'
num_done = len([*completed_2023])
num_total = len(peaks)
year_html += f'<span class="summary">{num_done}/{num_total}</span>\n'

# Patch index.md
NEW8 = '\n        '
contents = open('index.md').read()
contents = sub(contents, 'progress-3500', NEW8 + club_html.replace('\n', NEW8))
contents = sub(contents, 'progress-winter', NEW8 + winter_html.replace('\n', NEW8))
contents = sub(contents, 'progress-2023', NEW8 + year_html.replace('\n', NEW8))
with open('index.md', 'w') as out:
    out.write(contents)

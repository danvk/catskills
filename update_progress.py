#!/usr/bin/env python
"""Update progress in index.md using log.json"""

import json
import re
from collections import Counter

from make_geojson import extract_season

peaks = [
    'Slide',
    'Wittenberg',
    'Cornell',
    'Friday',
    'Balsam Cap',
    'Rocky',
    'Lone',
    'Table',
    'Peekamoose',
    'Panther',
    'Balsam',
    'Eagle',
    'Big Indian',
    'Fir',
    'Balsam Lake',
    'Bearpen',
    'Vly',
    'Halcott',
    'North Dome',
    'Sherrill',
    'Rusk',
    'Westkill',
    'Southwest Hunter',
    'Hunter',
    'Plateau',
    'Sugarloaf',
    'Indian Head',
    'Twin',
    'Blackhead',
    'Black Dome',
    'Thomas Cole',
    'Windham',
    'Kaaterskill High Peak',
]

winter_peaks = [
    'Slide',
    'Balsam',
    'Panther',
    'Blackhead'
]

others = ['Pisgah', 'Hayden', 'None']
known_peaks = set(peaks).union(set(others))

assert len(peaks) == 33
assert len(winter_peaks) == 4
assert set(winter_peaks).issubset(peaks)
assert set(others).isdisjoint(set(peaks))

LOG = json.load(open('map/log.json'))

completed_peaks = Counter()
completed_nonwinter_peaks = set()
completed_winter_peaks = set()
for hike in LOG:
    hike_peaks = set(hike['peaks'])
    for peak in hike_peaks:
        assert peak in known_peaks, f'Unknown peak: "{peak}"'
    if extract_season(hike['date']) == 'winter':
        completed_winter_peaks.update(hike_peaks)
    else:
        completed_nonwinter_peaks.update(hike_peaks)
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
for peak in completed_winter_peaks.intersection(winter_peaks):
    club_html += f'<span class="winter complete" title="{peak}"></span>\n'
    num_done += 1
for peak in set(winter_peaks).difference(completed_winter_peaks):
    club_html += f'<span class="winter incomplete" title="{peak}"></span>\n'
    num_left += 1
for peak in qualifying:
    club_html += f'<span class="3500 complete" title="{peak}"></span>\n'
    num_done += 1
for peak in set(peaks).difference(qualifying):
    num_left += 1
    club_html += f'<span class="3500 incomplete" title="{peak}"></span>\n'
num_total = num_left + num_done
club_html += f'<span class="summary">{num_done}/{num_total}</span>\n'

# Winter peaks
winter_html = ''
for peak in completed_winter_peaks:
    winter_html += f'<span class="winter complete" title="{peak}"></span>\n'
for peak in set(peaks).difference(completed_winter_peaks):
    winter_html += f'<span class="winter incomplete" title="{peak}"></span>\n'
num_done = len([*completed_winter_peaks])
num_total = len(peaks)
winter_html += f'<span class="summary">{num_done}/{num_total}</span>\n'

# Patch index.md
old_contents = open('index.md').read()
contents = re.sub(r'(<!--progress-3500-->).*(<!--/progress-3500-->)', r'\1' + club_html + r'\2', old_contents)
contents = re.sub(r'(<!--progress-winter-->).*(<!--/progress-winter-->)', r'\1' + winter_html + r'\2', contents)
with open('index.md', 'w') as out:
    out.write(contents)

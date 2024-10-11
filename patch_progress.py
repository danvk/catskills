#!/usr/bin/env python
"""Update progress in index.md using log.json"""

import json
from collections import Counter
import datetime

from constants import peaks
from make_geojson import extract_season
from utils import sub

winter_peaks = [
    'Slide',
    'Balsam',
    'Panther',
    'Blackhead'
]

others = [
    # Catskills-adjacent
    'Pisgah', 'Hayden', 'None', 'Dry Brook Ridge',
    # White Mountains
    'Mt. Washington', 'Mt. Monroe',
    # Jokes
    'Lone Wolf',
]
known_peaks = set(peaks).union(set(others))

assert len(peaks) == 33
assert len(winter_peaks) == 4
assert set(winter_peaks).issubset(peaks)
assert set(others).isdisjoint(set(peaks))

LOG = json.load(open('map-src/public/log.json'))


# Four Seasons:
# HA: https://hikersanonymous.org/index.html#4-seasons
# https://hikersanonymous.org/index.html#the-catskill-35
# Winter: December 21 through March 21
# Spring: March 22 through June 21
# Summer: June 22 through September 21
# Fall: September 22 through December 20
# Standard 33 + RT + South Doubletop
#
# Catskill Mountain Club
# https://www.catskillmountainclub.org/the-catskills-4-seasons-140-the-catskills-grid-420
# Winter: 12/21 – 3/20
# Spring: 3/21 – 6/20
# Summer: 6/21 – 9/20
# Fall: 9/21 – 12/20
# Standard 33 + Dry Brook Ridge + Mill Brook Ridge

# days: 2
# assume all peaks are on the indicated date, unless day2peaks
# Either that will be true, or the +/-1 day won't matter.

SEASONS = ['winter', 'spring', 'summer', 'fall']
SEASONS_HA = [
    ('03-22', '06-21', 'spring'),
    ('06-22', '09-21', 'summer'),
    ('09-22', '12-20', 'fall'),
    # otherwise: winter
]

SEASONS_CMC = [
    ('03-21', '06-20', 'spring'),
    ('06-21', '09-20', 'summer'),
    ('09-21', '12-20', 'fall'),
    # otherwise: winter
]

def season_for_date(date: str) -> tuple[str, str]:
    """Returns a (HA/3500, CMC) pair of seasons: winter, spring, summer, fall"""
    return get_season(date, SEASONS_HA), get_season(date, SEASONS_CMC)


def get_season(date: str, seasons):
    mmdd = date[5:]
    assert mmdd[2] == '-'
    for start, stop, season in seasons:
        if start <= mmdd <= stop:
            return season
    return 'winter'


def next_day(date: str):
    y, m, d = date.split('-')
    dt = datetime.date(int(y), int(m), int(d))
    dt += datetime.timedelta(days=1)
    return dt.strftime('%Y-%m-%d')


def get_peak_dates(hike):
    """Returns a list of (peak, date) for the hike"""
    date1 = hike['date']
    peaks2 = hike.get('day2peaks')
    if not peaks2:
        return [(peak, date1) for peak in hike['peaks']]

    peaks1 = set(hike['peaks']).difference(peaks2)
    date2 = next_day(hike['date'])
    return [
        (peak, date1) for peak in peaks1
    ] + [(peak, date2) for peak in peaks2]


peaks_3500 = peaks
peaks_ha = peaks_3500 + ['Doubletop', 'Roundtop']
peaks_cmc = peaks_3500 + ['Millbrook Ridge', 'Dry Brook Ridge']
all_catskill_peaks = set(peaks_ha + peaks_cmc)

completed_peaks = Counter()
completed_nonwinter_peaks = set()
completed_winter_peaks = set()
completed_2023 = set()
completed_4seasons_ha = set()
completed_4seasons_cmc = set()
completed_peaks_alex = Counter()
completed_winter_peaks_alex = set()
completed_nonwinter_peaks_alex = set()

for hike in LOG:
    hike_peaks = set(hike['peaks'])
    for peak in hike_peaks:
        assert peak in known_peaks, f'Unknown peak: "{peak}"'
    listable_peaks = hike_peaks.intersection(all_catskill_peaks)
    if not listable_peaks:
        continue

    catskill_3500 = listable_peaks.intersection(peaks)
    if catskill_3500:
        if extract_season(hike['date']) == 'winter':
            completed_winter_peaks.update(catskill_3500)
        else:
            completed_nonwinter_peaks.update(catskill_3500)
        if hike['date'].startswith('2023'):
            completed_2023.update(catskill_3500)
        completed_peaks.update(catskill_3500)

        if 'Alex' in hike['hikers']:
            completed_peaks_alex.update(catskill_3500)
            if extract_season(hike['date']) == 'winter':
                completed_winter_peaks_alex.update(catskill_3500)
            else:
                completed_nonwinter_peaks_alex.update(catskill_3500)

    # Four Seasons
    dated_hikes = get_peak_dates(hike)
    for peak, date in dated_hikes:
        season_ha, season_cmc = season_for_date(date)
        if peak in peaks_ha:
            completed_4seasons_ha.add(f'{peak}: {season_ha}')
        if peak in peaks_cmc:
            completed_4seasons_cmc.add(f'{peak}: {season_cmc}')


# print(f'HA: {len(completed_4seasons_ha)}: {completed_4seasons_ha}')
# print(f'CMC: {len(completed_4seasons_cmc)}: {completed_4seasons_cmc}')

# print('\n'.join(sorted(completed_4seasons_ha)))
# print('\n'.join(sorted(completed_4seasons_cmc)))

def get_qualifying_peaks(completed_peaks, completed_nonwinter_peaks):
    """Get peaks that count towards the 33 peaks in the 3500 club.

    Winter peaks count if done twice.
    """
    qualifying = set()
    for peak in set(peaks).intersection(completed_peaks):
        if peak in winter_peaks:
            if peak in completed_nonwinter_peaks or completed_peaks.get(peak) >= 2:
                qualifying.add(peak)
        else:
            qualifying.add(peak)
    return qualifying


# qualifying_alex = get_qualifying_peaks(completed_peaks_alex, completed_nonwinter_peaks_alex)
# print(len(qualifying), qualifying)
# print(len(qualifying_alex), qualifying_alex)

def get_3500club_html(completed_peaks, completed_nonwinter_peaks):
    qualifying = get_qualifying_peaks(completed_peaks, completed_nonwinter_peaks)

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
    return club_html

club_html = get_3500club_html(completed_peaks, completed_nonwinter_peaks)
club_html_alex = get_3500club_html(completed_peaks_alex, completed_nonwinter_peaks_alex)

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

# Four Seasons
def seasons_html(group, group_peaks):
    html = ''
    for season in SEASONS:
        num_season = 0
        html += f'<div class="season {season}">'
        html += '<span class="progress-bar">'
        for peak in sorted(group_peaks, key=lambda peak: f'{peak}: {season}' not in group):
            peak_season = f'{peak}: {season}'
            completed = peak_season in group
            state = 'complete' if completed else 'incomplete'
            num_season += (1 if completed else 0)
            html += f'<span class="{state}" title="{peak_season}"></span>\n'
        html += '</span>'
        html += f'<span class="summary">{season}: {num_season}/{len(group_peaks)}</span>\n'
        html += '</div>'
    num_done = len(group)
    num_total = len(group_peaks) * len(SEASONS)
    html += f'<span class="summary">Total: {num_done}/{num_total}</span>\n'
    return html

ha_html = seasons_html(completed_4seasons_ha, peaks_ha)
cmc_html = seasons_html(completed_4seasons_cmc, peaks_cmc)

# Patch index.md
NEW8 = '\n        '
contents = open('index.md').read()
contents = sub(contents, 'progress-3500', NEW8 + club_html.replace('\n', NEW8))
contents = sub(contents, 'progress-3500-alex', NEW8 + club_html_alex.replace('\n', NEW8))
contents = sub(contents, 'progress-winter', NEW8 + winter_html.replace('\n', NEW8))
contents = sub(contents, 'progress-2023', NEW8 + year_html.replace('\n', NEW8))
contents = sub(contents, 'progress-4seasons-ha', NEW8 + ha_html.replace('\n', NEW8))
contents = sub(contents, 'progress-4seasons-cmc', NEW8 + cmc_html.replace('\n', NEW8))
with open('index.md', 'w') as out:
    out.write(contents)

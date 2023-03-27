#!/usr/bin/env python

import json
from collections import defaultdict

from constants import peaks, peak_details
from utils import sub


for details in peak_details:
    key = details.alt_name or details.name
    if key not in peaks:
        raise KeyError(details.name)

hikes = json.load(open('map-src/public/log.json'))

hikes_by_peak = defaultdict(lambda: [])
for hike in hikes:
    for peak in hike['peaks']:
        hikes_by_peak[peak].append(hike)

table_md = '''
| Rank | Peak | Height (ft) | Type | Hike |
| ---- | ---- | ----------- | ---- | ---- |
'''

for peak in peak_details:
    key = peak.alt_name or peak.name
    peak_hikes = hikes_by_peak[key]
    hike_links = []
    for hike in peak_hikes:
        date = hike['date']
        title = hike['title']
        slug = hike['slug']
        hike_links.append(f'[{date}: {title}][{slug}]')
    hikes_md = '<br>'.join(hike_links) if hike_links else '_None Yet!_'
    table_md += f'| {peak.rank} | {peak.name} | {peak.height_ft} | {peak.type} | {hikes_md} |\n'

table_md += '\n'
for hike in hikes:
    slug = hike['slug']
    url = hike['url']
    table_md += f'[{slug}]: {url}\n'

contents = open('peaks.md').read()
contents = sub(contents, 'by-peak', table_md)
with open('peaks.md', 'w') as out:
    out.write(contents)

#!/usr/bin/env python
"""Read YAML front matter from posts to make combined hikes.json file."""

import json
import yaml
import sys

from constants import BLOG_ROOT


def read_frontmatter(stream) -> dict:
    lines = []
    on = False
    for line in stream:
        if line == '---\n':
            if on:
                break
            else:
                on = True
                continue
        if on:
            lines.append(line)
    frontmatter = '\n'.join(lines)
    return yaml.safe_load(frontmatter)


def format_meta(meta: dict) -> dict:
    return {
        'title': meta['title'],
        'date': meta['Date'].strftime('%Y-%m-%d'),
        'type': meta['Type'],
        'slug': meta['slug'],
        'miles': meta['Mileage (mi)'],
        'hike_hours': meta['Hiking Time (h)'],
        'peaks': meta['Peaks'].split(', '),
        'hikers': ['DanVK'] + meta['Other Participants'].split(', ')
    }


def main():
    hikes = []
    for path in BLOG_ROOT.glob('20*/*.md'):
        sys.stderr.write(str(path) + '\n')
        meta = read_frontmatter(open(path))
        hikes.append(format_meta(meta))
    hikes.sort(key=lambda hike: hike['date'])
    json.dump(hikes, sys.stdout, indent=2)


if __name__ == '__main__':
    main()

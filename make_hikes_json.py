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
    if 'excerpt' not in meta:
        # TODO: fill in excerpt based on the post
        pass
    slug = meta['slug']
    date = meta['date']
    slashed_date = date.strftime('%Y/%m/%d')
    dashed_date = date.strftime('%Y-%m-%d')
    return {
        **meta,
        'date': dashed_date,
        'peaks': meta['peaks'].split(', '),
        **({'day2peaks': meta['day2peaks'].split(', ')} if 'day2peaks' in meta else {}),
        'hikers': meta['hikers'].split(', '),
        'url': f'/catskills/{slashed_date}/{slug}.html'
    }


def main():
    hikes = []
    for path in sorted(BLOG_ROOT.glob('_posts/*.md')):
        sys.stderr.write(str(path) + '\n')
        meta = read_frontmatter(open(path))
        if meta.get('layout') == 'non-hike-post':
            sys.stderr.write(f'Skipping non-post {path}\n')
            continue
        hikes.append(format_meta(meta))
    hikes.sort(key=lambda hike: hike['date'], reverse=True)
    with open('map-src/public/log.json', 'w') as out:
        json.dump(hikes, out, indent=2)


if __name__ == '__main__':
    main()

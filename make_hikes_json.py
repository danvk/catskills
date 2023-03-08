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
    return {
        **meta,
        'date': meta['date'].strftime('%Y-%m-%d'),
        'peaks': meta['peaks'].split(', '),
        'hikers': meta['hikers'].split(', ')
    }


def main():
    hikes = []
    for path in BLOG_ROOT.glob('_posts/*.md'):
        sys.stderr.write(str(path) + '\n')
        meta = read_frontmatter(open(path))
        hikes.append(format_meta(meta))
    hikes.sort(key=lambda hike: hike['date'])
    json.dump(hikes, sys.stdout, indent=2)


if __name__ == '__main__':
    main()

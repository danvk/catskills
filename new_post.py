#!/usr/bin/env python

import re
import sys
from pathlib import Path


def extract_slug(slug: str) -> [str, str]:
    """e.g. 2023-12-26-hunter-sw -> 2023-12-26, 2023-12-26-hunter-sw"""
    m = re.match(r'(\d{4}-\d\d-\d\d)-.*', slug)
    assert m
    return (m.group(1), slug)


def write_stub(out, date: str, slug: str):
    out.write(f'''
---
date: {date}
slug: {slug}
type: Loop?
miles: 12?
hike_hours: 3?
elevation_ft: 456?
peaks: ???
hikers: Dan
title: '...'
excerpt: ...
---

Timeline:

- Start
- Summit
- Back at car

- Tracks: [AllTrails], [eBird]
- Conditions: ...

text
    '''.strip())


if __name__ == '__main__':
    try:
        date, slug = extract_slug(sys.argv[1])
    except IndexError:
        print('Usage: ./new_post.py YYYY-MM-DD-slug')
        sys.exit(1)

    post = Path('_posts') / f'{slug}.md'
    with open(post, 'w') as out:
        write_stub(out, date, slug)

    assets = Path('assets') / slug
    assets.mkdir()
#!/usr/bin/env python
"""Add 'date', 'slug', track image and all other image links to a post.

Intended to be run via VS Code action.
"""

import sys
from pathlib import Path


if __name__ == '__main__':
    (md_file,) = sys.argv[1:]
    slug: str = Path(md_file).name.replace('.md', '')
    assets_dir = Path('.') / 'assets' / slug
    date = slug[:10]

    baseurl = '{{site.baseurl}}'
    images = [
        f'![Alt Text]({baseurl}/{path})'
        for path in assets_dir.glob('*.jpeg')
    ]
    images_md = '\n'.join(sorted(images))

    old_post = open(md_file).read()

    _, frontmatter, post = old_post.split('---')
    if 'date:' not in frontmatter:
        frontmatter = f'date: {date}\nslug: {slug}{frontmatter}'

    new_post = f'''---{frontmatter}---
[![GPS Track of the hike]({baseurl}/assets/{slug}/track.png)]({baseurl}/map/?hike={slug})

{images_md}{post}'''
    with open(md_file, 'w') as out:
        out.write(new_post)

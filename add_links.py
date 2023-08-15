#!/usr/bin/env python
"""Add missing links to the bottom of a Markdown document."""

import sys
import re

if __name__ == '__main__':
    (md_file,) = sys.argv[1:]
    old_post = open(md_file).read()

    present = set()
    for m in re.finditer(r'^\[([^]]+)\]: ', old_post, re.M):
        present.add(m.group(1).lower())

    links = []
    for m in re.finditer(r'(?<!!)\[([^]]+)\](?![\[\(])', old_post):
        link = m.group(1)
        if link.lower() not in present:
            links.append(link)

    new_links = '\n'.join(f'[{link}]:' for link in links)

    new_post = f'{old_post}\n{new_links}\n'
    with open(md_file, 'w') as out:
        out.write(new_post)

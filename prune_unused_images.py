#!/usr/bin/env python
from pathlib import Path
import sys


def main():
    (path,) = sys.argv[1:]
    md = open(path).read()
    slug = Path(path).stem
    print(slug)
    assets = Path('assets') / slug
    images = [im for im in assets.iterdir() if im.name.endswith(('.png', '.jpeg', '.jpg'))]

    to_delete: list[Path] = []
    for im in images:
        name = im.name
        if f'/{name}' not in md:
            to_delete.append(im)

    for p in to_delete:
        new_name = p.parent / f'unused-{p.name}'
        p.rename(new_name)
        print(f'Renamed {p} -> {new_name}')


if __name__ == "__main__":
    main()

# Dan's Catskills Adventures

See:

- [Dan Hikes the Catskills] Blog
- [Map View] of my hikes
- [Interactive Hike Planner] for peak efficiency in peak bagging
- [Computing in the Catskills] repo for analysis of the most efficient routes
- [gpx-tools] for some tools I wrote to facilitate data collection for past hikes

The idea is to collect all my Catskills hikes on a public website. I got a lot of value out of [this 2013 blog][1] while planning hikes, and I'd like to "pay it forward" by sharing my own notes and hikes.

Things to include:

- Blog post for each hike with photos
- Interactive map with all hikes
- Notes on planning / logistics

## Development

    bundle exec jekyll serve

## Publishing updates

    ./update-hikes.sh
    git commit -a -m '...'
    git push

## Writing posts

Links and image sources should start with `{{site.baseurl}}`.

Use `<!-- excerpt --> ... <!-- /excerpt -->` to delineate an excerpt paragraph.

To generate the AllTrails images:

- print the track on AllTrails
- position the map as you like
- Download as PDF
- Open in Preview
- Export at PNG at 144dpi
- Use `pngquant` to shrink the resulting PNG

## Notes on making GPX tracks

Older hikes and tracks (pre-2022) were reconstructed using time and location data in photos. See [gpx-tools] repo for details.

[1]: https://www.njnyhikes.com/p/map.html

[Dan Hikes the Catskills]: https://danvk.org/catskills/
[Map View]: https://danvk.org/catskills/map/
[Interactive Hike Planner]: https://danvk.org/catskills/map/planner/
[Computing in the Catskills]: https://github.com/danvk/computing-in-the-catskills/
[gpx-tools]: https://github.com/danvk/gpx-tools/

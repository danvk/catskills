# Dan's Catskills Adventures

The idea is to collect all my Catskills hikes on a public website. I got a lot of value out of [this 2013 blog][1] while planning hikes, and I'd like to "pay it forward" by sharing my own notes and hikes.

Things to include:

- Blog post for each hike with photos
- Interactive map with all hikes
- Notes on planning / logistics

## TODO

- Blog
  - [x] Collect notes for all hikes
  - [x] Make slugged directories for all hikes
  - [x] Make spreadsheet listing of all hikes
  - [x] Make the "blog" -- posts for each hike
  - [x] Format frontmatter for each post
  - [ ] Add map visualization for each post
  - [x] Make a root page
    - [x] Mention 2013 hiker's blog
    - [ ] Mention my interest in birding
    - [x] Link to Catskill 3500 Club organized hikes
    - [ ] Reconstruct how I got interested in this
  - [x] Make an RSS feed

- Data collection
  - [ ] Collect GPX data for all hikes
    - [x] How do I get GPX from eBird? (Lat/Lng seq in `data-maptrack-data`, no times)
    - [x] convert to properly-formatted zulu time in `fc_to_track.py`
    - [x] Make per-day tracks
    - [ ] Add campsites
    - [x] Consolidate scripts in one repo (not `danvk.github.io`)
  - [ ] Collect photos for all hikes
  - [ ] Ask Max, John, Alex for photos from our hikes
  - [ ] Do I have Google location data for old hikes?
        (Do I have Google location data in any form?)

- Map visualization
  - [x] Write a script to convert GPX -> GeoJSON FeatureCollection
  - [x] Add all peaks to the Mapbox map
  - [ ] Make peak style look more like AllTrails
  - [x] Add elevation to the Mapbox map
  - [ ] Show which peaks I've hiked and which I haven't
  - [x] Show all tracks on a map
  - [ ] Zoom map to Catskills State Park on page load
  - [ ] Add distance scale to map
  - [ ] Show photos on the map
  - [ ] Fix the position of Lone
  - [ ] Show notes for each hike
  - [ ] Organize hikes by type
  - [ ] Filter hikes by dates (winter, month, etc.)
  - [ ] Eliminate the scroll bounce
  - [ ] Convert this to a CRA app

## Notes on making GPX tracks

I can generate a GeoJSON FeatureCollection from photos by downloading a ZIP file from Google Photos and running it through my google-photo-map extractor. I can then convert that to a rough GPX using `fc_to_track.py`.

To snap the lines in that GPX to trails, load it into gpx.studio and add some new waypoints, following trail routing.

It's hard to [see time][time] in gpx.studio. I tried using placemark.io but it's not much better (you can click a GPX point to see the time but can't get direction arrows) and it costs $20/month.

## Notes on setting up the site

I'd hoped to use Deno (`deno bundle`), but it seems like it really is for server-side code.

I'm trying out yarn2. One surprise was that it created a git repo in my subdir. For `.gitignore`: https://yarnpkg.com/getting-started/qa#which-files-should-be-gitignored

yarn2 requires special support in VSCode:

    yarn dlx @yarnpkg/sdks vscode

Command-clicking symbols to see their types doesn't work in VS Code since there's no `node_modules`. To make this work you need to install the ZipFS plugin.

After seeing some unstyled content for my hike list, I'd like to use a UI component library. I'd like to use something other than Material-UI. There's this thread <https://www.reddit.com/r/reactjs/comments/s12qci/looking_for_a_material_ui_alternative/> which recommends Mantine.

- Maintine
- Tailwind UI: is it free?

esbuild has a "serve" mode that works much better than watch + http-server. I tend not to use "hot reloading" but it might work well for this app.

In the time it took to run `brew install gdal` I learned about an npm alternative and ran the command to get a Catskill Park GeoJSON file:

    npx osmtogeojson /Users/danvk/Downloads/catskill-relation.xml > catskill-park.geojson

This site has a bunch of hike logs:
https://mountain-hiking.com/friday-balsam-cap-b25/#B-25_Military_Bomber_Wreck

And it links to this site, which has a GPX viewer:
https://www.gaiagps.com/public/R2eaNlqY3lgk4dZEYezOoI6O/R2eaNlqY3lgk4dZEYezOoI6O?layer=GaiaTopoRasterFeet

https://www.catskillhiker.net/Catskill35/peaks/friday.shtml

[1]: https://www.njnyhikes.com/p/map.html
[time]: https://github.com/gpxstudio/gpxstudio.github.io/issues/227

import type mapboxglType from "mapbox-gl";
import { parkStyle, peakTypeColor, trackStyle, trackStyleSelected, trackStyleSelectedOutline } from "./style";

// TODO: disable in production
new EventSource('/esbuild').addEventListener('change', () => location.reload())

declare global {
  const mapboxgl: typeof mapboxglType;
}

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGFudmsiLCJhIjoiY2lrZzJvNDR0MDBhNXR4a2xqNnlsbWx3ciJ9.myJhweYd_hrXClbKk8XLgQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v12",
  // style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [-74.36398700976565, 42.0922169187148],
  zoom: 10,
});

map.on("load", () => {
  map.addSource('mapbox-dem', {
    'type': 'raster-dem',
    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
    'tileSize': 512,
    'maxzoom': 14
  });
  // add the DEM source as a terrain layer with exaggerated height
  map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

  map
    .addSource("tracks", {
      type: "geojson",
      data: "tracks.geojson",
    })
    .addSource('catskill-park', {
      type: 'geojson',
      data: 'catskill-park.geojson',
    })
    .addLayer({
      id: 'catskill-park',
      source: 'catskill-park',
      ...parkStyle,
    })
    .addLayer({
      id: "tracks",
      source: "tracks",
      ...trackStyle,
    })
    .addLayer({
      id: 'tracks-highlight-outline',
      source: 'tracks',
      ...trackStyleSelectedOutline,
    })
    .addLayer({
      id: 'tracks-highlight',
      source: 'tracks',
      ...trackStyleSelected,
    })
    .addSource("peaks", {
      type: "geojson",
      data: "high-peaks.geojson",
    })
    .addLayer({
      id: "peak-labels",
      type: "symbol",
      source: "peaks",
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 12,
        "text-offset": [0, 1],
        "text-anchor": "top",
      },
      paint: {
        "text-color": peakTypeColor,
      },
    })
    .addLayer({
      id: "peaks",
      type: "circle",
      source: "peaks",
      layout: {
      },
      paint: {
        'circle-radius': 4,
        'circle-color': peakTypeColor,
        'circle-stroke-color': 'white',
      },
    });

  let hoveredStateId: string | number | undefined;
  map
    .on("mousemove", "tracks", (e) => {
      if (e.features?.length) {
        if (hoveredStateId !== undefined) {
          map.setFeatureState(
            { source: "tracks", id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = e.features[0].id;
        const hoverSlug = e.features[0].properties.slug;
        map.setFeatureState(
          { source: "tracks", id: hoveredStateId },
          { hover: true }
        );
        document.querySelector(`[data-slug="${hoverSlug}"]`)?.classList.add('hovered');
      }
    })
    .on("mouseleave", "tracks", (e) => {
      if (hoveredStateId !== null) {
        map.setFeatureState(
          { source: "tracks", id: hoveredStateId },
          { hover: false }
        );
      }
      hoveredStateId = undefined;
      for (const el of document.querySelectorAll('.hike')) {
        el.classList.remove('hovered');
      }
    });
});

interface Hike {
  title: string;
  url: string;
  slug: string;
  date: string;
  type: string;
  miles: string;
  hike_hours: string;
  peaks: string[];
  hikers: string[];
}

(async () => {
  const logR = await fetch('log.json');
  if (!logR.ok) {
    throw new Error(logR.status + ' ' + logR.statusText);
  }
  const hikes = await logR.json() as Hike[];

  const hikeContainer = document.getElementById('hike-list');
  let lastYear = null;
  for (const hike of hikes) {
    const year = hike.date.slice(0, 4);
    if (year !== lastYear) {
      lastYear = year;
      const yearH = document.createElement('h1');
      yearH.textContent = String(year);
      hikeContainer?.append(yearH);
    }
    const div = document.createElement('div');
    div.className = 'hike';
    div.innerHTML = `
      <span class="date">${hike.date}</span>
      <span class="stats">${hike.miles}mi ${hike.type} / ${hike.hike_hours}h</span>
      <h2><a href="${hike.url}">${hike.title}</a></h2>
      ${hike.peaks.map(peak => `<span class="peak">${peak}</span>`).join('')}<br>
    `
    div.setAttribute('data-slug', hike.slug);
    hikeContainer?.append(div);
  }
})().catch(e => {
  console.error(e);
});

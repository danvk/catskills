import Map, { Layer, Marker, Source } from "react-map-gl";

import { UseQueryResult } from "@tanstack/react-query";
import { Hike } from "./HikeList";

import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZGFudmsiLCJhIjoiY2lrZzJvNDR0MDBhNXR4a2xqNnlsbWx3ciJ9.myJhweYd_hrXClbKk8XLgQ";

export interface Props {
  hikes: UseQueryResult<readonly Hike[], unknown>;
}

export const parkStyle = {
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": "brown",
    "line-width": 1,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

const peakTypeColor: mapboxgl.Expression = [
  "match",
  ["get", "type"],
  "dec",
  "darkgreen",
  "trail",
  "brown",
  "bushwhack",
  "red",
  "closed",
  "pink",
  "black",
];

const peakLabelStyle = {
  type: "symbol",
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    "text-size": 12,
    "text-offset": [0, 1],
    "text-anchor": "top",
    // 'text-allow-overlap': true,
    // 'icon-allow-overlap': true,
  },
  paint: {
    "text-color": peakTypeColor,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

export function HikeMap(props: Props) {
  const { hikes } = props;
  const hiked = React.useMemo(
    () =>
      hikes.status === "success"
        ? [...new Set(hikes.data.flatMap((hike: any) => hike.peaks))]
        : null,
    [hikes]
  );

  return (
    <div id="map">
      <Map
        initialViewState={{
          latitude: 42.0922169187148,
          longitude: -74.36398700976565,
          zoom: 10,
        }}
        mapStyle="mapbox://styles/danvk/clf7a8rz5001j01qerupylm4t"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <Source id="catskill-park" type="geojson" data="catskill-park.geojson">
          <Layer id="catskill-park" {...parkStyle} />
        </Source>
        <Source id="high-peaks" type="geojson" data="high-peaks.geojson">
          <Layer id="peak-labels" {...peakLabelStyle} />
        </Source>
      </Map>
    </div>
  );
}

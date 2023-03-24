import Map, { Layer, Marker, Source } from "react-map-gl";

import { UseQueryResult } from "@tanstack/react-query";
import { Hike } from "./HikeList";

import "mapbox-gl/dist/mapbox-gl.css";

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

export function HikeMap(props: Props) {
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
        <Source
          id="catskill-park"
          type="geojson"
          data="catskill-park.geojson"
        >
          <Layer id="catskill-park" {...parkStyle} />
        </Source>
      </Map>
    </div>
  );
}

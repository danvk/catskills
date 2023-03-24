import Map, {Marker} from 'react-map-gl';

import { UseQueryResult } from "@tanstack/react-query";
import { Hike } from "./HikeList";

import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGFudmsiLCJhIjoiY2lrZzJvNDR0MDBhNXR4a2xqNnlsbWx3ciJ9.myJhweYd_hrXClbKk8XLgQ';

export interface Props {
  hikes: UseQueryResult<readonly Hike[], unknown>;
}

export function HikeMap(props: Props) {
  return (
    <Map
      initialViewState={{
        latitude: 37.8,
        longitude: -122.4,
        zoom: 14
      }}
      style={{width: 800, height: 600}}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <Marker longitude={-122.4} latitude={37.8} color="red" />
    </Map>
  );
}

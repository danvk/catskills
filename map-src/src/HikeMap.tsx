import Map, { Layer, Source, useMap } from "react-map-gl";

import { UseQueryResult } from "@tanstack/react-query";
import { Hike } from "./HikeList";

import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import { FeatureCollection, LineString } from "geojson";
import { Point, TrackProps } from "./HikeInfoPanel";
import mapboxgl from "mapbox-gl";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZGFudmsiLCJhIjoiY2lrZzJvNDR0MDBhNXR4a2xqNnlsbWx3ciJ9.myJhweYd_hrXClbKk8XLgQ";

export interface Props {
  hikes: UseQueryResult<readonly Hike[], unknown>;
  tracks: UseQueryResult<FeatureCollection<LineString, TrackProps>, unknown>;
  scrubPoint: Point | null;
  selectedHikeSlug: string | null;
  onSelectHike: (slug: string) => void;
}

export const parkStyle = {
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": "rgb(0, 32, 248)",
    "line-width": 1,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

const scrubStyle = {
  type: 'circle',
  paint: {
    'circle-color': 'blue',
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
  }
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
    "icon-allow-overlap": true,
  },
  paint: {
    "text-color": peakTypeColor,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

interface UseMapImageOptions {
  url: string;
  name: string;
  sdf?: boolean;
}

type MapImageResult = "loading" | "ok";
export function useMapImage({
  url,
  name,
  sdf = false,
}: UseMapImageOptions): MapImageResult {
  const [state, setState] = React.useState<MapImageResult>("loading");
  const mapRef = useMap();
  React.useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap() as mapboxgl.Map;

      map.loadImage(url, (error, image) => {
        if (error) throw error;
        if (!image) throw "Unable to load image";
        if (!map.hasImage(name)) map.addImage(name, image, { sdf });
        setState("ok");
      });
    }
  }, [mapRef.current]);

  return state;
}

function noop() {}
const EMPTY_FC: FeatureCollection<any, any> = {
  type: "FeatureCollection",
  features: [],
};

export function HikeMap(props: Props) {
  const { hikes, tracks, scrubPoint } = props;
  const hiked = React.useMemo(
    () =>
      hikes.status === "success"
        ? [...new Set(hikes.data.flatMap((hike: any) => hike.peaks))]
        : null,
    [hikes]
  );

  const scrubFeature: FeatureCollection = React.useMemo(() => {
    return {
      type: "FeatureCollection",
      features: scrubPoint
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: [scrubPoint.lng, scrubPoint.lat],
              },
            },
          ]
        : [],
    };
  }, [scrubPoint]);

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
        onClick={(e) => {
          const { properties } = e.features?.[0] ?? {};
          if (properties?.slug) {
            props.onSelectHike(properties.slug);
          }
        }}
        interactiveLayerIds={["tracks"]}
      >
        <Source id="catskill-park" type="geojson" data="catskill-park.geojson">
          <Layer id="catskill-park" {...parkStyle} />
        </Source>
        <MountainPeaks hiked={hiked} />
        <HikeTracks
          tracks={
            tracks.status === "loading" || tracks.status === "error"
              ? EMPTY_FC
              : tracks.data
          }
          selectedHikeSlug={props.selectedHikeSlug}
          onSelectHike={props.onSelectHike}
          onHoverHike={noop}
        />
        <Source id="scrub" type="geojson" data={scrubFeature}>
          <Layer id="scrub" {...scrubStyle} />
        </Source>
      </Map>
    </div>
  );
}

function MountainPeaks(props: { hiked: readonly string[] | null }) {
  const { hiked } = props;
  const mountainIcon = useMapImage({
    url: "mountain-solid.png",
    name: "mountain-solid",
    sdf: true,
  });

  const peakSymbols = React.useMemo(
    () =>
      ({
        type: "symbol",
        source: "peaks",
        layout: {
          "icon-image": "mountain-solid",
          "icon-allow-overlap": true,
          "icon-size": 0.25,
        },
        paint: {
          // 'circle-radius': 4,
          "icon-color": peakTypeColor,
          // 'icon-halo-color': 'rgba(0, 0, 0, 0.5)',
          // 'icon-halo-width': 2,
          // 'icon-halo-blur': 0.5,
          // 'circle-stroke-color': 'white',
        },
      } satisfies Partial<mapboxgl.AnyLayer>),
    [hiked]
  );

  return (
    <Source id="high-peaks" type="geojson" data="high-peaks.geojson">
      <Layer id="peak-labels" {...peakLabelStyle} />
      {mountainIcon === "ok" ? (
        <Layer id="peaks" {...peakSymbols} beforeId="peak-labels" />
      ) : null}
    </Source>
  );
}

interface HikeTrackProps {
  tracks: FeatureCollection<LineString, TrackProps>;
  selectedHikeSlug: string | null;
  onSelectHike: (slug: string) => void;
  onHoverHike: (slug: string) => void;
}

function HikeTracks(props: HikeTrackProps) {
  const { selectedHikeSlug, tracks } = props;

  // TODO: show selected track on top
  const trackStyle = React.useMemo(
    () =>
      ({
        type: "line",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "slug"], selectedHikeSlug],
            "darkblue",
            "rgb(28,109,163)",
          ],
          "line-width": [
            "case",
            ["==", ["get", "slug"], selectedHikeSlug],
            6,
            3,
          ],
        },
      } satisfies Partial<mapboxgl.AnyLayer>),
    [selectedHikeSlug]
  );

  return (
    <Source type="geojson" id="tracks" data={tracks}>
      <Layer id="tracks" {...trackStyle} />
    </Source>
  );
}

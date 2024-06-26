import 'mapbox-gl/dist/mapbox-gl.css';

import {UseQueryResult} from '@tanstack/react-query';
import bbox from '@turf/bbox';
import {FeatureCollection, LineString, MultiLineString} from 'geojson';
import type mapboxgl from 'mapbox-gl';
import React from 'react';
import Map, {Layer, LayerProps, Source, useMap} from 'react-map-gl';

import {ScrubPoint, TrackProps} from './HikeInfoPanel';
import {Hike} from './HikeList';

export const MAPBOX_TOKEN =
  'pk.eyJ1IjoiZGFudmsiLCJhIjoiY2lrZzJvNDR0MDBhNXR4a2xqNnlsbWx3ciJ9.myJhweYd_hrXClbKk8XLgQ';

export interface Props {
  peaksGeoJSON: string;
  hikes: UseQueryResult<readonly Hike[]>;
  tracks: UseQueryResult<FeatureCollection<LineString, TrackProps>>;
  scrubPoint: ScrubPoint | null;
  selectedHikeSlug: string | null;
  onSelectHike: (slug: string) => void;
}

export const parkStyle = {
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': 'rgb(0, 32, 248)',
    'line-width': 1,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

const scrubStyle = {
  type: 'circle',
  paint: {
    'circle-color': 'blue',
    'circle-stroke-color': 'white',
    'circle-stroke-width': 2,
    'circle-radius': 7,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

const peakLabelStyleBase = {
  type: 'symbol',
  layout: {
    'text-field': ['get', 'name'],
    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    'text-size': 12,
    'text-offset': [0, 1],
    'text-anchor': 'top',
    // 'text-allow-overlap': true,
    'icon-allow-overlap': true,
  },
  paint: {},
} satisfies Partial<mapboxgl.AnyLayer>;

interface UseMapImageOptions {
  url: string;
  name: string;
  sdf?: boolean;
}

type MapImageResult = 'loading' | 'ok';
export function useMapImage({url, name, sdf = false}: UseMapImageOptions): MapImageResult {
  const [state, setState] = React.useState<MapImageResult>('loading');
  const mapRef = useMap();
  React.useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();

      map.loadImage(url, (error, image) => {
        if (error) {
          throw error;
        }
        if (!image) {
          throw new Error('Unable to load image');
        }
        if (!map.hasImage(name)) {
          map.addImage(name, image, {sdf});
        }
        setState('ok');
      });
    }
  }, [mapRef, name, sdf, url]);

  return state;
}

function noop() {
  // intentionally blank
}

export const EMPTY_FC: FeatureCollection<never, never> = {
  type: 'FeatureCollection',
  features: [],
};

export function HikeMap(props: Props) {
  const {hikes, tracks, selectedHikeSlug, scrubPoint} = props;
  const hiked = React.useMemo(
    () =>
      hikes.status === 'success' ? [...new Set(hikes.data.flatMap(hike => hike.peaks))] : null,
    [hikes],
  );

  const scrubFeature: FeatureCollection = React.useMemo(
    () => ({
      type: 'FeatureCollection',
      features: scrubPoint
        ? [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [scrubPoint.lng, scrubPoint.lat],
              },
            },
          ]
        : [],
    }),
    [scrubPoint],
  );

  return (
    <div id="map">
      <Map
        initialViewState={{
          latitude: 42.0922169187148,
          longitude: -74.36398700976565,
          zoom: 10,
        }}
        interactiveLayerIds={['tracks']}
        mapStyle="mapbox://styles/danvk/clf7a8rz5001j01qerupylm4t"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={e => {
          const {properties} = e.features?.[0] ?? {};
          if (properties?.slug) {
            props.onSelectHike(properties.slug as string);
          }
        }}>
        <Source data="/catskills/map/catskill-park.geojson" id="catskill-park" type="geojson">
          <Layer id="catskill-park" {...parkStyle} />
        </Source>
        <MountainPeaks peaksGeoJSON={props.peaksGeoJSON} hiked={hiked} />
        <HikeTracks
          selectedHikeSlug={props.selectedHikeSlug}
          tracks={
            tracks.status === 'loading' || tracks.status === 'error' ? EMPTY_FC : tracks.data
          }
          onHoverHike={noop}
          onSelectHike={props.onSelectHike}
        />
        <Source data={scrubFeature} id="scrub" type="geojson">
          <Layer id="scrub" {...scrubStyle} />
        </Source>
        {tracks.status === 'success' ? (
          <ZoomToTrack selectedHikeSlug={selectedHikeSlug} tracks={tracks.data} />
        ) : null}
      </Map>
    </div>
  );
}

export function MountainPeaks(props: {peaksGeoJSON: string; hiked: readonly string[] | null}) {
  const {peaksGeoJSON, hiked} = props;
  const mountainIcon = useMapImage({
    url: '/catskills/map/mountain-solid.png',
    name: 'mountain-solid',
    sdf: true,
  });

  const hikedColorExpr = React.useMemo(
    (): mapboxgl.Expression => [
      'case',
      ['==', ['get', 'type'], 'closed'],
      'pink',
      ['in', ['get', 'name'], ['literal', hiked]],
      'green',
      'grey',
    ],
    [hiked],
  );

  const peakSymbols = React.useMemo(
    () =>
      ({
        type: 'symbol',
        source: 'peaks',
        layout: {
          'icon-image': 'mountain-solid',
          'icon-allow-overlap': true,
          'icon-size': 0.25,
        },
        paint: {
          'icon-color': hikedColorExpr,
          'icon-opacity': ['case', ['==', ['get', 'type'], 'closed'], 0.0, 1.0],
        },
      } satisfies Partial<mapboxgl.AnyLayer>),
    [hikedColorExpr],
  );

  const peakLabelStyle = React.useMemo(
    (): LayerProps => ({
      ...peakLabelStyleBase,
      paint: {
        'text-color': hikedColorExpr,
        'text-opacity': ['case', ['==', ['get', 'type'], 'closed'], 0.0, 1.0],
      },
    }),
    [hikedColorExpr],
  );

  return (
    <Source data={peaksGeoJSON} id="high-peaks" type="geojson">
      <Layer id="peak-labels" {...peakLabelStyle} />
      {mountainIcon === 'ok' ? (
        <Layer id="peaks" {...peakSymbols} beforeId="peak-labels" />
      ) : null}
    </Source>
  );
}

interface HikeTrackProps {
  tracks: FeatureCollection<LineString | MultiLineString, TrackProps>;
  selectedHikeSlug: string | null;
  onSelectHike: (slug: string) => void;
  onHoverHike: (slug: string) => void;
}

export function HikeTracks(props: HikeTrackProps) {
  const {selectedHikeSlug, tracks} = props;

  // TODO: show selected track on top
  const trackStyle = React.useMemo(
    () =>
      ({
        type: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'slug'], selectedHikeSlug],
            'darkblue',
            'rgb(28,109,163)',
          ],
          'line-width': ['case', ['==', ['get', 'slug'], selectedHikeSlug], 6, 3],
        },
      } satisfies Partial<mapboxgl.AnyLayer>),
    [selectedHikeSlug],
  );

  return (
    <Source data={tracks} id="tracks" type="geojson">
      <Layer id="tracks" {...trackStyle} />
    </Source>
  );
}

function ZoomToTrack(props: {
  tracks: FeatureCollection<LineString, TrackProps>;
  selectedHikeSlug: string | null;
}) {
  const {tracks, selectedHikeSlug} = props;
  const map = useMap().current;
  React.useEffect(() => {
    if (selectedHikeSlug && map) {
      const hikeTracks = tracks.features.filter(f => f.properties.slug === selectedHikeSlug);
      if (hikeTracks.length) {
        const [minX, minY, maxX, maxY] = bbox({
          type: 'FeatureCollection',
          features: hikeTracks,
        });
        map.fitBounds([minX, minY, maxX, maxY], {
          animate: true,
          offset: [0, -50],
          padding: 200,
        });
      }
    }
  }, [tracks, selectedHikeSlug, map]);
  return null;
}

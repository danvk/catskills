import './HikeDetails.css';

import {useQuery} from '@tanstack/react-query';
import distance from '@turf/distance';
import GpxParser from 'gpxparser';
import React from 'react';

import {Dygraph} from './Dygraph';
import {Hike} from './HikeList';
import {FT_PER_M} from './constants';
import {fetchText} from './fetch';
import {addPace, rowRange, tuple} from './util';

export interface TrackProps {
  slug: string;
  date: string;
  path: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

type Viz = 'ele-vs-time' | 'ele-vs-distance' | 'distance-vs-time' | 'pace-mph';

export interface Props {
  selectedHikeSlug: string;
  hike: Hike;
  trackFeatureProps: TrackProps[];
  scrubPoint: ScrubPoint | null;
  onScrubPoint: (latLng: ScrubPoint | null) => void;
  onChangeSelectedHike: (hike: string | null) => void;
}

export function HikeInfoPanel(props: Props) {
  const {selectedHikeSlug: _, hike, trackFeatureProps} = props;

  const [selectedTrack, setSelectedTrack] = React.useState(0);

  const track = trackFeatureProps[selectedTrack];
  const gpxPath = '../assets/' + track.path;
  const gpxResource = useQuery({
    queryKey: [gpxPath],
    queryFn: fetchText,
  });

  const gpx = React.useMemo(() => {
    if (gpxResource.status !== 'success') {
      return null;
    }
    const parser = new GpxParser();
    parser.parse(gpxResource.data);
    return parser;
  }, [gpxResource.status, gpxResource.data]);

  const [viz, setViz] = React.useState<Viz>('ele-vs-time');

  return (
    <div id="hike-details">
      <div id="close-info-panel" onClick={() => props.onChangeSelectedHike(null)}>
        ✗
      </div>
      <h3>{hike.title}</h3>
      {trackFeatureProps.length > 1 ? (
        <select value={selectedTrack} onChange={e => setSelectedTrack(Number(e.target.value))}>
          {trackFeatureProps.map((t, i) => (
            <option key={i} value={i}>
              {t.path}
            </option>
          ))}
        </select>
      ) : null}
      <select value={viz} onChange={e => setViz(e.target.value as Viz)}>
        <option value="ele-vs-time">Elevation vs. Time</option>
        <option value="ele-vs-distance">Elevation vs. Distance</option>
        <option value="distance-vs-time">Distance vs. Time</option>
        <option value="pace-mph">Pace vs. Time</option>
      </select>
      {gpx ? (
        <ElevationChart
          gpx={gpx}
          scrubPoint={props.scrubPoint}
          viz={viz}
          onScrubPoint={props.onScrubPoint}
        />
      ) : null}
    </div>
  );
}

const DYGRAPH_STYLE: React.CSSProperties = {
  width: 550,
  height: 160,
};
const CHART_LABELS = ['Date/Time', 'Elevation (ft)', 'Distance (miles)', 'Pace (mph)'];

export interface ScrubPoint {
  time: Date;
  lat: number;
  lng: number;
  eleMeters: number;
  cumDMiles: number;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type HighlightCallback = React.ComponentProps<typeof Dygraph>['highlightCallback'] & Function;

function ElevationChart(props: {
  gpx: GpxParser;
  scrubPoint: ScrubPoint | null;
  onScrubPoint: (latLng: ScrubPoint | null) => void;
  viz: Viz;
}) {
  const {gpx, scrubPoint, onScrubPoint, viz} = props;
  const table = React.useMemo(() => {
    let cumD = 0;
    let lastPt = null;
    const rows = [];
    for (const pt of gpx.tracks[0].points) {
      if (!pt.ele) {
        continue;
      }
      if (lastPt) {
        const d = distance([pt.lon, pt.lat], [lastPt.lon, lastPt.lat], {units: 'miles'});
        cumD += d;
      }
      lastPt = pt;
      rows.push(tuple(pt.time, pt.ele * FT_PER_M, cumD));
    }
    return addPace(rows);
  }, [gpx]);

  const [labels, tableViz] = React.useMemo(() => {
    const cols =
      viz === 'ele-vs-time'
        ? [0, 1]
        : viz === 'ele-vs-distance'
        ? [2, 1]
        : viz === 'pace-mph'
        ? [0, 3]
        : [0, 2];
    return [
      [CHART_LABELS[cols[0]], CHART_LABELS[cols[1]]],
      table.map(row => [row[cols[0]], row[cols[1]]]),
    ];
  }, [table, viz]);

  const highlightCallback = React.useCallback<HighlightCallback>(
    (_e, x, _pt, row) => {
      const pt = gpx.tracks[0].points[row];
      onScrubPoint({
        lat: pt.lat,
        lng: pt.lon,
        time: pt.time,
        eleMeters: pt.ele,
        cumDMiles: table[row][2],
      });
    },
    [gpx.tracks, onScrubPoint, table],
  );

  const unhighlightCallback = React.useCallback(() => onScrubPoint(null), [onScrubPoint]);

  const [visibleRange, setVisibleRange] = React.useState<[number, number] | null>(null);

  const zoomCallback = React.useCallback((minDate: number, maxDate: number) => {
    setVisibleRange([minDate, maxDate]);
  }, []);

  const [elapsedTimeMin, eleGainFt, cumDMi] = React.useMemo(() => {
    const [a, b] = visibleRange ? rowRange(table, visibleRange) : [0, table.length - 1];
    const [aMs, aEleFt, aCumMi] = table[a];
    const [bMs, bEleFt, bCumMi] = table[b];

    return tuple(
      (bMs.getTime() - aMs.getTime()) / 1000 / 60,
      bEleFt - aEleFt,
      bCumMi - aCumMi,
    );
  }, [table, visibleRange]);

  return (
    <div id="elevation-chart">
      <div id="elevation-legend">
        {scrubPoint ? (
          <>
            {scrubPoint.time.toLocaleTimeString()}:{' '}
            {Math.round(scrubPoint.eleMeters * FT_PER_M)}ft ({scrubPoint.cumDMiles.toFixed(1)}{' '}
            mi)
          </>
        ) : null}
      </div>
      <Dygraph
        axisLabelWidth={60}
        color="darkblue"
        file={tableViz}
        highlightCallback={highlightCallback}
        highlightCircleSize={5}
        key={viz}
        labels={labels}
        legend="never"
        strokeWidth={2}
        style={DYGRAPH_STYLE}
        unhighlightCallback={unhighlightCallback}
        ylabel="Elevation (ft)"
        zoomCallback={zoomCallback}
      />
      <div className="visible-range-stats">
        {elapsedTimeMin.toFixed(0)} min, {cumDMi.toFixed(1)}mi{eleGainFt > 0 ? '+' : ''}
        {eleGainFt.toFixed(0)}ft
      </div>
    </div>
  );
}

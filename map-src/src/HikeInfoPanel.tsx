import { useQuery } from "@tanstack/react-query";
import GpxParser from "gpxparser";
import React from "react";
import distance from '@turf/distance';

import { fetchText } from "./fetch";
import { Hike } from "./HikeList";

import "./HikeDetails.css";
import { Dygraph } from "./Dygraph";

export interface TrackProps {
  slug: string;
  date: string;
  path: string;
  season: "spring" | "summer" | "fall" | "winter";
}

type Viz = 'ele-vs-time' | 'ele-vs-distance' | 'distance-vs-time';

export interface Props {
  selectedHikeSlug: string;
  hike: Hike;
  trackFeatureProps: TrackProps[];
  scrubPoint: ScrubPoint | null;
  onScrubPoint: (latLng: ScrubPoint | null) => void;
}

export function HikeInfoPanel(props: Props) {
  const { selectedHikeSlug, hike, trackFeatureProps } = props;

  const [selectedTrack, setSelectedTrack] = React.useState(0);

  const track = trackFeatureProps[selectedTrack];
  const gpxPath = "../assets/" + track.path;
  const gpxResource = useQuery({
    queryKey: [gpxPath],
    queryFn: fetchText,
  });

  const gpx = React.useMemo(() => {
    if (gpxResource.status !== "success") {
      return null;
    }
    const parser = new GpxParser();
    parser.parse(gpxResource.data);
    return parser;
  }, [gpxResource.status, gpxResource.data]);

  const [viz, setViz] = React.useState<Viz>('ele-vs-time');

  return (
    <div id="hike-details">
      <h3>{hike.title}</h3>
      {trackFeatureProps.length > 1 ? (
        <select onChange={e => setSelectedTrack(Number(e.target.value))}>
          {trackFeatureProps.map((t, i) => (
            <option key={i} value={i} selected={i === selectedTrack}>
              {t.path}
            </option>
          ))}
        </select>
      ) : null}
      <select value={viz} onChange={e => setViz(e.target.value as Viz)}>
        <option value="ele-vs-time">Elevation vs. Time</option>
        <option value="ele-vs-distance">Elevation vs. Distance</option>
        <option value="distance-vs-time">Distance vs. Time</option>
      </select>
      {gpx ? (
        <ElevationChart
          gpx={gpx}
          viz={viz}
          scrubPoint={props.scrubPoint}
          onScrubPoint={props.onScrubPoint}
        />
      ) : null}
    </div>
  );
}

const FT_IN_M = 3.28084;

const DYGRAPH_STYLE: React.CSSProperties = {
  width: 550,
  height: 160,
};
const CHART_LABELS = ["Date/Time", "Elevation (ft)", "Distance (miles)"];

export interface ScrubPoint {
  time: Date;
  lat: number;
  lng: number;
  eleMeters: number;
}

type HighlightCallback = React.ComponentProps<
  typeof Dygraph
>["highlightCallback"] &
  Function;

function ElevationChart(props: {
  gpx: GpxParser;
  scrubPoint: ScrubPoint | null;
  onScrubPoint: (latLng: ScrubPoint | null) => void;
  viz: Viz,
}) {
  const { gpx, scrubPoint, onScrubPoint, viz } = props;
  const table = React.useMemo(() => {
    let cumD = 0;
    let lastPt = null;
    const rows = [];
    for (const pt of gpx.tracks[0].points) {
      if (!pt.ele) continue
      if (lastPt) {
        const d = distance([pt.lon, pt.lat], [lastPt.lon, lastPt.lat], {units: 'miles'});
        cumD += d;
      }
      lastPt = pt;
      rows.push([pt.time, pt.ele * FT_IN_M, cumD]);
    }
    return rows;
  }, [gpx]);

  const [labels, tableViz] = React.useMemo(() => {
    const cols = viz === 'ele-vs-time' ? [0, 1] : viz === 'ele-vs-distance' ? [2, 1] : [0, 2];
    return [
      [CHART_LABELS[cols[0]], CHART_LABELS[cols[1]]],
      table.map(row => [row[cols[0]], row[cols[1]]])
    ];
  }, [table, viz]);

  const highlightCallback = React.useCallback<HighlightCallback>(
    function (this: Dygraph, _e, x, _pt, row) {
      const pt = gpx.tracks[0].points[row];
      onScrubPoint({
        lat: pt.lat,
        lng: pt.lon,
        time: pt.time,
        eleMeters: pt.ele,
      });
    },
    [gpx, onScrubPoint]
  );

  const unhighlightCallback = React.useCallback(
    () => onScrubPoint(null),
    [onScrubPoint]
  );

  return (
    <div id="elevation-chart">
      <div id="elevation-legend">
        {scrubPoint ? (
          <>
            {scrubPoint.time.toLocaleTimeString()}:{" "}
            {Math.round(scrubPoint.eleMeters * FT_IN_M)}ft
          </>
        ) : null}
      </div>
      <Dygraph
        key={viz}
        file={tableViz}
        ylabel="Elevation (ft)"
        axisLabelWidth={60}
        strokeWidth={2}
        color="darkblue"
        highlightCircleSize={5}
        labels={labels}
        style={DYGRAPH_STYLE}
        legend="never"
        highlightCallback={highlightCallback}
        unhighlightCallback={unhighlightCallback}
      />
    </div>
  );
}

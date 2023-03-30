import { useQuery } from "@tanstack/react-query";
import GpxParser from "gpxparser";
import React from "react";

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
      {gpx ? (
        <ElevationChart
          gpx={gpx}
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
const CHART_LABELS = ["Date/Time", "Elevation (ft)"];

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
}) {
  const { gpx, scrubPoint, onScrubPoint } = props;
  const table = React.useMemo(() => {
    return gpx.tracks[0].points
      .filter((p) => p.ele)
      .map((p) => [p.time, p.ele * FT_IN_M]);
  }, [gpx]);

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
        file={table}
        ylabel="Elevation (ft)"
        axisLabelWidth={60}
        strokeWidth={2}
        color="darkblue"
        highlightCircleSize={5}
        labels={CHART_LABELS}
        style={DYGRAPH_STYLE}
        legend="never"
        highlightCallback={highlightCallback}
        unhighlightCallback={unhighlightCallback}
      />
    </div>
  );
}

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
  onScrubPoint: (latLng: Point | null) => void;
}

export function HikeInfoPanel(props: Props) {
  const { selectedHikeSlug, hike, trackFeatureProps } = props;
  const track = trackFeatureProps[0];
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
      {gpx ? (
        <ElevationChart gpx={gpx} onScrubPoint={props.onScrubPoint} />
      ) : null}
    </div>
  );
}

const FT_IN_M = 3.28084;

const DYGRAPH_STYLE: React.CSSProperties = {
  width: 500,
  height: 160,
};
const CHART_LABELS = ["Date/Time", "Elevation (ft)"];

export interface Point {
  lat: number;
  lng: number;
}

type HighlightCallback = React.ComponentProps<typeof Dygraph>["highlightCallback"] & Function;

function ElevationChart(props: {
  gpx: GpxParser;
  onScrubPoint: (latLng: Point | null) => void;
}) {
  const { gpx, onScrubPoint } = props;
  const table = React.useMemo(() => {
    return gpx.tracks[0].points.map((p) => [p.time, p.ele * FT_IN_M]);
  }, [gpx]);

  const highlightCallback = React.useCallback<HighlightCallback>(
    (_e, _x, _pt, row) => {
      // XXX this doesn't work when you're zoomed :(
      const pt = gpx.tracks[0].points[row];
      onScrubPoint({ lat: pt.lat, lng: pt.lon });
    },
    [gpx, onScrubPoint]
  );

  return (
    <div id="elevation-chart">
      <Dygraph
        file={table}
        ylabel="Elevation (ft)"
        axisLabelWidth={60}
        labels={CHART_LABELS}
        style={DYGRAPH_STYLE}
        labelsSeparateLines
        highlightCallback={highlightCallback}
      />
    </div>
  );
}

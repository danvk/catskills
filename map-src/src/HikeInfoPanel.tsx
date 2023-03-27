import { useQuery } from "@tanstack/react-query";
import GpxParser from 'gpxparser';
import { fetchText } from "./fetch";
import { Hike } from "./HikeList";

import "./HikeDetails.css";
import React from "react";

export interface TrackProps {
  slug: string;
  date: string;
  path: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface Props {
  selectedHikeSlug: string;
  hike: Hike;
  trackFeatureProps: TrackProps[];
}

export function HikeInfoPanel(props: Props) {
  const {selectedHikeSlug, hike, trackFeatureProps} = props;
  const track = trackFeatureProps[0];
  const gpxPath = '../assets/' + track.path;
  const gpxResource = useQuery({
    queryKey: [gpxPath],
    queryFn: fetchText,
  })

  const gpx = React.useMemo(() => {
    if (gpxResource.status !== 'success') {
      return null;
    }
    const parser = new GpxParser();
    parser.parse(gpxResource.data);
    return parser;
  }, [gpxResource]);

  return (
    <div id="hike-details">
      <h3>{hike.title}</h3>
      {track.date} ({track.season})
      {gpx ? <ElevationChart gpx={gpx} /> : null}
    </div>
  )
}

function ElevationChart(props: {gpx: GpxParser}) {
  const {gpx} = props;
  return (
    <div id="elevation-chart">
      {gpx.tracks[0].points.length} points
    </div>
  )
}

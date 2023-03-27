import { useQuery } from "@tanstack/react-query";
import { fetchText } from "./fetch";
import "./HikeDetails.css";
import { Hike } from "./HikeList";

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

  return (
    <div id="hike-details">
      <h3>{hike.title}</h3>
      {track.date} ({track.season})
    </div>
  )
}

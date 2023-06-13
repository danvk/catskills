import { Feature, FeatureCollection } from "geojson";
import _ from 'lodash';
import React from "react";
import Map, { Layer, Source, useMap } from "react-map-gl";

import { EMPTY_FC, MAPBOX_TOKEN, MountainPeaks, parkStyle } from "./HikeMap";

import './HikePlanner.css';

const PEAKS = {
  S: "Slide Mountain",
  H: "Hunter Mountain",
  BD: "Blackdome Mountain",
  BH: "Blackhead Mountain",
  TC: "Thomas Cole Mountain",
  We: "West Kill Mountain",
  C: "Cornell Mountain",
  Ta: "Table Mountain",
  Pk: "Peekamoose Mountain",
  Pl: "Plateau Mountain",
  Su: "Sugarloaf Mountain",
  W: "Wittenberg Mountain",
  SW: "Southwest Hunter",
  L: "Lone Mountain",
  BL: "Balsam Lake Mountain",
  P: "Panther Mountain",
  BI: "Big Indian Mountain",
  Fr: "Friday Mountain",
  Ru: "Rusk Mountain",
  KHP: "Kaaterskill High Peak",
  Tw: "Twin Mountain",
  BC: "Balsam Cap Mountain",
  Fi: "Fir Mountain",
  ND: "North Dome Mountain",
  B: "Balsam Mountain",
  Bp: "Bearpen Mountain",
  E: "Eagle Mountain",
  IH: "Indian Head Mountain",
  Sh: "Sherrill Mountain",
  V: "Vly Mountain",
  WHP: "Windham High Peak",
  Ha: "Halcott Mountain",
  Ro: "Rocky Mountain",
};
type Peak = keyof typeof PEAKS;
const ALL_PEAKS = Object.keys(PEAKS) as Peak[];

const MODES = [
  "unrestricted",
  "loops-only",
  "day-only",
  "day-loop-only",
  "prefer-loop",
  "day-only-prefer-loop",
] as const;
type Mode = (typeof MODES)[number];

interface HikePlannerRequest {
  peaks: Peak[];
  mode: Mode;
}

interface HikePlannerResponse {
  solution: {
    d_km: number;
    d_mi: number;
    num_hikes: number;
    hikes: [number, number[]][];
    // XXX weird that this isn't Feature[]
    features: FeatureCollection;
  };
}

// TODO: increase memory limit / timeout for function
async function getHikes(req: HikePlannerRequest): Promise<HikePlannerResponse> {
  const r = await fetch(
    "https://qa0q1ij69f.execute-api.us-east-1.amazonaws.com/find-hikes",
    {
      method: "post",
      body: JSON.stringify(req),
    }
  );
  return r.json();
}

// TODO: use react-query for this
export interface LoadingState {
  state: "loading";
}
export interface ErrorState {
  state: "error";
  error: unknown;
}
export interface SuccessState<T> {
  state: "ok";
  data: T;
}
/** A deferred/promised value can be in one of three states: loading, error or success. */
export type PromiseState<T> = LoadingState | ErrorState | SuccessState<T>;

export function HikePlanner() {
  const [peaks, setPeaks] = React.useState(ALL_PEAKS);
  const [mode, setMode] = React.useState<Mode>('unrestricted');

  const selectAll = React.useCallback(() => {
    setPeaks(ALL_PEAKS);
  }, []);
  const selectNone = React.useCallback(() => {
    setPeaks([]);
  }, []);
  const selectInvert = React.useCallback(() => {
    setPeaks((oldPeaks) => ALL_PEAKS.filter((code) => oldPeaks.includes(code)));
  }, []);
  const togglePeak = React.useCallback<React.ChangeEventHandler>((e) => {
    const peak = e.target.id as keyof typeof PEAKS;
    setPeaks((oldPeaks) =>
      oldPeaks.includes(peak)
        ? oldPeaks.filter((p) => p !== peak)
        : oldPeaks.concat([peak])
    );
  }, []);

  const [proposedHikes, setProposedHikes] =
    React.useState<PromiseState<HikePlannerResponse> | null>(null);
  const search = React.useCallback(async () => {
    let isInvalidated = false;
    const r: HikePlannerRequest = {peaks, mode};
    setProposedHikes({ state: "loading" });
    try {
      const proposals = await getHikes(r);
      if (!isInvalidated) {
        setProposedHikes({ state: "ok", data: proposals });
      }
    } catch (e) {
      if (!isInvalidated) {
        setProposedHikes({ state: "error", error: e });
      }
    }
    return () => {
      isInvalidated = true;
    };
  }, [peaks, mode]);

  return (
    <div className="App hike-planner">
      <div className="hike-control-panel">
        Hike Preference: <select value={mode} onChange={e => setMode(e.currentTarget.value as Mode)}>
          {MODES.map(m => <option key={m}>{m}</option>)}
        </select>
        <br/>
        <button onClick={search}>Find Hikes</button>
        <br />
        <button onClick={selectAll}>All</button>
        <button onClick={selectNone}>None</button>
        <button onClick={selectInvert}>Invert</button>
        <br />
        {ALL_PEAKS.map((code) => (
          <React.Fragment key={code}>
            <label>
              <input
                type="checkbox"
                checked={peaks.includes(code)}
                id={code}
                onChange={togglePeak}
              />{" "}
              {PEAKS[code]}
            </label>
            <br />
          </React.Fragment>
        ))}
        {proposedHikes ? (
          <div className="proposed-hikes">
            {proposedHikes.state === "loading" ? (
              "Loading…"
            ) : proposedHikes.state === "error" ? (
              `Error: ${proposedHikes.error}`
            ) : (
              <ProposedHikesList plan={proposedHikes.data} />
            )}
          </div>
        ) : null}
      </div>
      <HikePlannerMap
        peaks={peaks}
        hikes={
          proposedHikes?.state === "ok"
            ? proposedHikes.data.solution.features.features
            : null
        }
      />
    </div>
  );
}

interface ProposedHikesProps {
  plan: HikePlannerResponse;
}

function ProposedHikesList(props: ProposedHikesProps) {
  const { plan } = props;
  const { solution } = plan;
  const idToName = _.fromPairs(solution.features.features.map(f => [f.properties?.id, f.properties?.name]));

  return (
    <>
      <hr/>
      Proposed Hikes:
      {solution.num_hikes} hikes, {solution.d_mi.toFixed(1)} miles.
      <ul>
        {plan.solution.hikes.map((hike, i) => (
          <li key={i}>{(hike[0] * 0.621371).toFixed(1)} mi: {hike[1].map(id => idToName[id]).filter(x => !!x).join('→')}</li>
        ))}
      </ul>
    </>
  );
}

interface HikePlannerMapProps {
  peaks: Peak[];
  hikes: Feature[] | null;
}

const hikeStyle = {
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": "rgb(28,109,163)",
    "line-width": 3,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

function HikePlannerMap(props: HikePlannerMapProps) {
  const { peaks, hikes } = props;
  const hikeFeatures = React.useMemo((): FeatureCollection => {
    return hikes
      ? {
          type: "FeatureCollection",
          features: hikes.filter(
            (f) =>
              f.geometry.type === "LineString" ||
              f.geometry.type === "MultiLineString"
          ),
        }
      : EMPTY_FC;
  }, [hikes]);

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
        <Source id="catskill-park" type="geojson" data="catskill-park.geojson">
          <Layer id="catskill-park" {...parkStyle} />
        </Source>
        <Source type="geojson" id="hikes" data={hikeFeatures}>
          <Layer id="hikes" {...hikeStyle} />
        </Source>
        <MountainPeaks hiked={peaks.map((p) => SHORT_PEAKS[p])} />
      </Map>
    </div>
  );
}

const SHORT_PEAKS: Record<keyof typeof PEAKS, string> = {
  S: "Slide",
  H: "Hunter",
  BD: "Black Dome",
  BH: "Thomas Cole",
  TC: "Blackhead",
  We: "Westkill",
  C: "Cornell",
  Ta: "Table",
  Pk: "Peekamoose",
  Pl: "Plateau",
  Su: "Sugarloaf",
  W: "Wittenberg",
  SW: "Southwest Hunter",
  L: "Balsam Lake",
  BL: "Lone",
  P: "Panther",
  BI: "Big Indian",
  Fr: "Friday",
  Ru: "Rusk",
  KHP: "Kaaterskill High Peak",
  Tw: "Twin",
  BC: "Balsam Cap",
  Fi: "Fir",
  ND: "North Dome",
  B: "Eagle",
  Bp: "Balsam",
  E: "Bearpen",
  IH: "Indian Head",
  Sh: "Mount Sherrill",
  V: "Halcott",
  WHP: "Vly",
  Ha: "Windham",
  Ro: "Rocky",
};

const OSM_IDS: [string, number, string][] = [
  ['S', 2426171552, 'Slide Mountain'],
  ['H', 1938201532, 'Hunter Mountain'],
  ['BD', 2473476912, 'Blackdome Mountain'],
  ['BH', 2473476747, 'Blackhead Mountain'],
  ['TC', 2473476927, 'Thomas Cole Mountain'],
  ['We', 2955311547, 'West Kill Mountain'],
  ['C', 2884119551, 'Cornell Mountain'],
  ['Ta', 7292479776, 'Table Mountain'],
  ['Pk', 2398015279, 'Peekamoose Mountain'],
  ['Pl', 2882649917, 'Plateau Mountain'],
  ['Su', 2882649730, 'Sugarloaf Mountain'],
  ['W', 2884119672, 'Wittenberg Mountain'],
  ['SW', 1938215682, 'Southwest Hunter'],
  ['L', -1136, 'Lone Mountain'],
  ['BL', 2897919022, 'Balsam Lake Mountain'],
  ['P', 9147145385, 'Panther Mountain'],
  ['BI', 357548762, 'Big Indian Mtn Mountain'],
  ['Fr', 9953707705, 'Friday Mountain'],
  ['Ru', 10033501291, 'Rusk Mountain'],
  ['KHP', 9785950126, 'Kaaterskill High Peak'],
  ['Tw', 7982977638, 'Twin Mountain'],
  ['BC', 9953729846, 'Balsam Cap Mountain'],
  ['Fi', 357559622, 'Fir Mountain'],
  ['ND', 357574030, 'North Dome Mountain'],
  ['B', 2845338212, 'Balsam Mountain'],
  ['Bp', 212348771, 'Bearpen Mountain'],
  ['E', 357557378, 'Eagle Mountain'],
  ['IH', 7978185605, 'Indian Head Mountain'],
  ['Sh', 10010091368, 'Sherrill Mountain'],
  ['V', 10010051278, 'Vly Mountain'],
  ['WHP', 2426236522, 'Windham High Peak'],
  ['Ha', 357563196, 'Halcott Mountain'],
  ['Ro', -538, 'Rocky Mountain'],
];

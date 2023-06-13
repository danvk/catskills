import { Feature } from "geojson";
import React from "react";
import Map, { Layer, Source, useMap } from "react-map-gl";
import { UseQueryResult } from "@tanstack/react-query";

import { MAPBOX_TOKEN, MountainPeaks, parkStyle } from "./HikeMap";

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
  BI: "Big Indian Mtn Mountain",
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
  'unrestricted',
  'loops-only',
  'day-only',
  'day-loop-only',
  'prefer-loop',
  'day-only-prefer-loop',
] as const;
type Mode = typeof MODES[number];

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
    features: Feature[];
  }
}

// TODO: increase memory limit / timeout for function
async function getHikes(req: HikePlannerRequest): Promise<HikePlannerResponse> {
  const r = await fetch('https://qa0q1ij69f.execute-api.us-east-1.amazonaws.com/find-hikes', {
    method: 'post',
    body: JSON.stringify(req),
  });
  return r.json();
}

// TODO: use react-query for this
export interface LoadingState {
  state: 'loading';
}
export interface ErrorState {
  state: 'error';
  error: unknown;
}
export interface SuccessState<T> {
  state: 'ok';
  data: T;
}
/** A deferred/promised value can be in one of three states: loading, error or success. */
export type PromiseState<T> = LoadingState | ErrorState | SuccessState<T>;


export function HikePlanner() {
  const [peaks, setPeaks] = React.useState(ALL_PEAKS);

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

  const [proposedHikes, setProposedHikes] = React.useState<PromiseState<HikePlannerResponse> | null>(null);
  const search = React.useCallback(async () => {
    let isInvalidated = false;
    const r: HikePlannerRequest = {
      peaks,
      mode: 'unrestricted',
    };
    setProposedHikes({state: 'loading'});
    try {
      const proposals = await getHikes(r);
      if (!isInvalidated) {
        setProposedHikes({state: 'ok', data: proposals});
      }
    } catch (e) {
      if (!isInvalidated) {
        setProposedHikes({state: 'error', error: e});
      }
    }
    return () => {
      isInvalidated = true;
    }
  }, [peaks]);

  return (
    <div className="App hike-planner">
      <div className="hike-control-panel">
        <button onClick={selectAll}>All</button>
        <button onClick={selectNone}>None</button>
        <button onClick={selectInvert}>Invert</button>
        <br />
        <button onClick={search}>Find Hikes</button>
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
        {proposedHikes ?
          <div className="proposed-hikes">
            {
            proposedHikes.state === 'loading'
            ? 'Loading…'
            : proposedHikes.state === 'error'
            ? `Error: ${proposedHikes.error}`
            : <>
                Proposed Hikes:
                {proposedHikes.data.solution.d_mi} miles, {proposedHikes.data.solution.num_hikes} hikes.
                <ul>
                  {proposedHikes.data.solution.hikes.map((hike, i) =>
                    <li key={i}>{JSON.stringify(hike)}</li>
                  )}
                </ul>
              </>
            }
          </div>
        : null}
      </div>
      <HikePlannerMap peaks={peaks} />
    </div>
  );
}

function HikePlannerMap(props: { peaks: (keyof typeof PEAKS)[] }) {
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
        <MountainPeaks hiked={props.peaks.map((p) => SHORT_PEAKS[p])} />
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

import './HikePlanner.css';

import {Feature, FeatureCollection} from 'geojson';
import _ from 'lodash';
import React from 'react';
import Map, {Layer, Source} from 'react-map-gl';
import { useLocation, useNavigate } from 'react-router-dom';

import {EMPTY_FC, MAPBOX_TOKEN, MountainPeaks, parkStyle} from './HikeMap';

const PEAKS = {
  S: 'Slide Mountain',
  H: 'Hunter Mountain',
  BD: 'Blackdome Mountain',
  BH: 'Blackhead Mountain',
  TC: 'Thomas Cole Mountain',
  We: 'West Kill Mountain',
  C: 'Cornell Mountain',
  Ta: 'Table Mountain',
  Pk: 'Peekamoose Mountain',
  Pl: 'Plateau Mountain',
  Su: 'Sugarloaf Mountain',
  W: 'Wittenberg Mountain',
  SW: 'Southwest Hunter',
  L: 'Lone Mountain',
  BL: 'Balsam Lake Mountain',
  P: 'Panther Mountain',
  BI: 'Big Indian Mountain',
  Fr: 'Friday Mountain',
  Ru: 'Rusk Mountain',
  KHP: 'Kaaterskill High Peak',
  Tw: 'Twin Mountain',
  BC: 'Balsam Cap Mountain',
  Fi: 'Fir Mountain',
  ND: 'North Dome Mountain',
  B: 'Balsam Mountain',
  Bp: 'Bearpen Mountain',
  E: 'Eagle Mountain',
  IH: 'Indian Head Mountain',
  Sh: 'Sherrill Mountain',
  V: 'Vly Mountain',
  WHP: 'Windham High Peak',
  Ha: 'Halcott Mountain',
  Ro: 'Rocky Mountain',
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
    features: Feature[];
  };
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

export function lightlyEncodeURIComponent(param: string) {
  return param.replace(/\+/g, '%2B').replace(/ /g, '+').replace(/&/g, '%26');
}

export function lightlyDecodeURIComponent(param: string) {
  return param.replace(/%26/g, '&').replace(/\+/g, ' ').replace(/%2B/g, '+');
}

function createSearchParams(params?: Record<string, string>): string {
  return Object.entries(params ?? {}).map(([k, v]) => k + '=' + lightlyEncodeURIComponent(v)).join('&');
}

export type SetURLSearchParams = (
  nextInit?:
    | Record<string, string>
    | ((prev: URLSearchParams) => Record<string, string>),
) => void;

// See https://github.com/remix-run/react-router/blob/fe661c5c0405c2212a5299b75af362df9f031b11/packages/react-router-dom/index.tsx#L904
function useLightlyEncodedSearchParams(): [URLSearchParams, SetURLSearchParams] {
  const location = useLocation();
  const searchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const navigate = useNavigate();
  const setSearchParams = React.useCallback<SetURLSearchParams>(
    (nextInit) => {
      const newSearchParams = createSearchParams(
        typeof nextInit === 'function' ? nextInit(searchParams) : nextInit,
      );
      navigate('?' + newSearchParams, {replace: true});
    },
    [navigate, searchParams],
  );

  return [searchParams, setSearchParams];
}

export function HikePlanner() {
  const [searchParams, setSearchParams] = useLightlyEncodedSearchParams();
  const peaksParam = searchParams.get('peaks');
  const peaks = (peaksParam === null ? ALL_PEAKS : peaksParam.split(',')) as Peak[];
  const mode = (searchParams.get('mode') ?? 'unrestricted') as Mode;

  const setPeaks = React.useCallback(
    (newPeaks: string[]) => {
      setSearchParams({peaks: newPeaks.join(','), mode});
    },
    [mode, setSearchParams],
  );
  const setMode = React.useCallback(
    (newMode: Mode) => {
      setSearchParams({peaks: peaks.join(','), mode: newMode});
    },
    [peaks, setSearchParams],
  );

  const selectAll = React.useCallback(() => {
    setPeaks(ALL_PEAKS);
  }, [setPeaks]);
  const selectNone = React.useCallback(() => {
    setPeaks([]);
  }, [setPeaks]);
  const selectInvert = React.useCallback(() => {
    setPeaks(ALL_PEAKS.filter(code => peaks.includes(code)));
  }, [peaks, setPeaks]);
  const togglePeak = React.useCallback<React.ChangeEventHandler>(
    e => {
      const peak = e.target.id as keyof typeof PEAKS;
      setPeaks(peaks.includes(peak) ? peaks.filter(p => p !== peak) : peaks.concat([peak]));
    },
    [peaks, setPeaks],
  );

  const [proposedHikes, setProposedHikes] =
    React.useState<PromiseState<HikePlannerResponse> | null>(null);
  const search = React.useCallback(() => {
    (async () => {
      const r: HikePlannerRequest = {peaks, mode};
      setProposedHikes({state: 'loading'});
      try {
        const proposals = await getHikes(r);
        // TODO: invalidate when there's a new query
        setProposedHikes({state: 'ok', data: proposals});
      } catch (e) {
        setProposedHikes({state: 'error', error: e});
      }
    })();
  }, [peaks, mode]);

  return (
    <div className="App hike-planner">
      <div className="hike-control-panel">
        Hike Preference:{' '}
        <select value={mode} onChange={e => setMode(e.currentTarget.value as Mode)}>
          {MODES.map(m => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <br />
        <button onClick={search}>Find Hikes</button>
        <br />
        <button onClick={selectAll}>All</button>
        <button onClick={selectNone}>None</button>
        <button onClick={selectInvert}>Invert</button>
        <br />
        {ALL_PEAKS.map(code => (
          <React.Fragment key={code}>
            <label>
              <input
                checked={peaks.includes(code)}
                id={code}
                type="checkbox"
                onChange={togglePeak}
              />{' '}
              {PEAKS[code]}
            </label>
            <br />
          </React.Fragment>
        ))}
        {proposedHikes ? (
          <div className="proposed-hikes">
            {proposedHikes.state === 'loading' ? (
              'Loading…'
            ) : proposedHikes.state === 'error' ? (
              `Error: ${proposedHikes.error}`
            ) : (
              <ProposedHikesList plan={proposedHikes.data} />
            )}
          </div>
        ) : null}
      </div>
      <HikePlannerMap
        hikes={proposedHikes?.state === 'ok' ? proposedHikes.data.solution.features : null}
        peaks={peaks}
      />
    </div>
  );
}

interface ProposedHikesProps {
  plan: HikePlannerResponse;
}

function ProposedHikesList(props: ProposedHikesProps) {
  const {plan} = props;
  const {solution} = plan;
  const idToName = _.fromPairs(
    solution.features.map(f => [f.properties?.id, f.properties?.name]),
  );

  return (
    <>
      <hr />
      Proposed Hikes:
      {solution.num_hikes} hikes, {solution.d_mi.toFixed(1)} miles.
      <ul>
        {plan.solution.hikes.map((hike, i) => (
          <li key={i}>
            {(hike[0] * 0.621371).toFixed(1)} mi:{' '}
            {hike[1]
              .map(id => idToName[id])
              .filter(x => !!x)
              .join('→')}
          </li>
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
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': 'rgb(28,109,163)',
    'line-width': 3,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

const parkingLotStyle = {
  type: 'symbol',
  layout: {
    'icon-image': 'parking',
    'icon-allow-overlap': true,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

function HikePlannerMap(props: HikePlannerMapProps) {
  const {peaks, hikes} = props;
  const hikeFeatures = React.useMemo(
    (): FeatureCollection =>
      hikes
        ? {
            type: 'FeatureCollection',
            features: hikes.filter(
              f => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString',
            ),
          }
        : EMPTY_FC,
    [hikes],
  );
  const parkingLotFeatures = React.useMemo(
    (): FeatureCollection =>
      hikes
        ? {
            type: 'FeatureCollection',
            features: hikes.filter(f => f.properties?.type === 'parking-lot'),
          }
        : EMPTY_FC,
    [hikes],
  );

  return (
    <div id="map">
      <Map
        initialViewState={{
          latitude: 42.0922169187148,
          longitude: -74.36398700976565,
          zoom: 10,
        }}
        mapStyle="mapbox://styles/danvk/clf7a8rz5001j01qerupylm4t"
        mapboxAccessToken={MAPBOX_TOKEN}>
        <Source data="/catskills/map/catskill-park.geojson" id="catskill-park" type="geojson">
          <Layer id="catskill-park" {...parkStyle} />
        </Source>
        <Source data={hikeFeatures} id="hikes" type="geojson">
          <Layer id="hikes" {...hikeStyle} />
        </Source>
        <Source data={parkingLotFeatures} id="lots" type="geojson">
          <Layer id="lots" {...parkingLotStyle} />
        </Source>
        <MountainPeaks hiked={peaks.map(p => SHORT_PEAKS[p])} />
      </Map>
    </div>
  );
}

const SHORT_PEAKS: Record<keyof typeof PEAKS, string> = {
  S: 'Slide',
  H: 'Hunter',
  BD: 'Black Dome',
  BH: 'Blackhead',
  TC: 'Thomas Cole',
  We: 'Westkill',
  C: 'Cornell',
  Ta: 'Table',
  Pk: 'Peekamoose',
  Pl: 'Plateau',
  Su: 'Sugarloaf',
  W: 'Wittenberg',
  SW: 'Southwest Hunter',
  L: 'Lone',
  BL: 'Balsam Lake',
  P: 'Panther',
  BI: 'Big Indian',
  Fr: 'Friday',
  Ru: 'Rusk',
  KHP: 'Kaaterskill High Peak',
  Tw: 'Twin',
  BC: 'Balsam Cap',
  Fi: 'Fir',
  ND: 'North Dome',
  B: 'Balsam',
  Bp: 'Bearpen',
  E: 'Eagle',
  IH: 'Indian Head',
  Sh: 'Mount Sherrill',
  V: 'Vly',
  WHP: 'Windham',
  Ha: 'Halcott',
  Ro: 'Rocky',
};

/*
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
*/

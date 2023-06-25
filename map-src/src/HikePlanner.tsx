import './HikePlanner.css';

import {Feature, FeatureCollection, Geometry} from 'geojson';
import _ from 'lodash';
import React from 'react';
import Map, {Layer, Source} from 'react-map-gl';
import {useLocation, useNavigate} from 'react-router-dom';

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

const SLIDE_PEAKS = ['S', 'C', 'Ta', 'Pk', 'W', 'L', 'P', 'BC', 'Fr', 'Ro'] as const;
const BIG_INDIAN_PEAKS = ['BL', 'BI', 'Fi', 'B', 'E'] as const;
const SPRUCETON_PEAKS = ['H', 'We', 'SW', 'Ru', 'ND', 'Sh', 'Ha'] as const;
const PLATTE_CLOVE_PEAKS = ['Pl', 'Su', 'KHP', 'Tw', 'IH'] as const;
const WINDHAM_BLACKHEAD_PEAKS = ['BD', 'BH', 'TC', 'WHP'] as const;
const BEARPEN_PEAKS = ['Bp', 'V'] as const;

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

const NAMED_HIKES = [
  ['Burroughs Range', 'S,C,W'],
  ['Woodland Valley Quartet', 'S,C,W,P'],
  ['The Six', 'Fr,BC,Ro,L,Ta,Pk'],
  ['The Nine', 'S,C,W,Fr,BC,Ro,L,Ta,Pk'],
  ['The Ocho', 'C,W,Fr,BC,Ro,L,Ta,Pk'],
  ['Moonhaw Four', 'C,W,Fr,BC'],
  ['Denning Four', 'Ro,L,Ta,Pk'],
  ['Fisherman’s Four', 'Fr,BC,Ro,L'],
  ['High Low', 'S,Ro'],
  ['FirBBiE', 'Fi,BI,E,B'],
  ['Burnham Hollow 3', 'Fi,BI,E'],
  ['Triple Biscuit', 'Fi,BI,D'],
  ['Biscuits and Gravy', 'Fi,BI,D,E,B'],
  ['Pine Hill Trail Triple', 'BI,E,B'],
  ['Double Beaver', 'D,BL'],
  ['Double Balsam Plus', 'BL,E,B'],
  ['Double Balsam', 'BL,B'],
  ['Rusk Hunter Loop', 'Ru,H,SW'],
  ['Spruceton Straightshot', 'Sh,ND,We'],
  ['Spruceton Scattershot', 'Ha,We,Ru'],
  ['Spruceton Trail Triple', 'We,H,SW'],
  ['Spruceton Horseshoe', 'We,Ru,H,SW'],
  ['Six West', 'Sh,ND,We,Ru,H,SW'],
  ['The Shaft', 'Ha,Sh,ND'],
  ['Spruceton Bushwhack Doubleshot', 'Sh,ND,Ru'],
  ['The Other Nine', 'Sh,ND,We,H,SW,Pl,Su,Tw,IH'],
  ['DPE4', 'Pl,Su,Tw,IH'],
  ['Mink-Gillespie Horseshoe', 'Pl,Su,Tw,IH,KHP,RT'],
  ['Devils Path', 'We,Pl,Su,Tw,IH'],
  ['High Peaks Doubleshot', 'KHP,WHP,RT'],
  ['Platte Clove Four', 'Tw,IH,KHP,RT'],
  ['Blackhead Range', 'TC,BD,BH'],
  ['Windham-Blackhead Horseshoe', 'TC,BD,BH,WHP'],
  ['Escarpment Peaks', 'BH,WHP'],
  ['Halvly', 'Ha,Bp,V'],
];
const PEAKS_TO_NAME = _.fromPairs(
  NAMED_HIKES.map(([name, peaks]) => [_.sortBy(peaks.split(',')).join(','), name]),
);

interface HikePlannerResponse {
  solution: {
    d_km: number;
    d_mi: number;
    num_hikes: number;
    hikes: [number, number[]][];
    features: Feature[];
  };
  peak_ids: [Peak, number, string][];
}

const ENDPOINT = 'https://qa0q1ij69f.execute-api.us-east-1.amazonaws.com/find-hikes';
// 'http://localhost:5000/find-hikes';

async function getHikes(req: HikePlannerRequest): Promise<HikePlannerResponse> {
  const r = await fetch(ENDPOINT, {
    method: 'post',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
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
  return Object.entries(params ?? {})
    .map(([k, v]) => k + '=' + lightlyEncodeURIComponent(v))
    .join('&');
}

export type SetURLSearchParams = (
  nextInit?: Record<string, string> | ((prev: URLSearchParams) => Record<string, string>),
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
    nextInit => {
      const newSearchParams = createSearchParams(
        typeof nextInit === 'function' ? nextInit(searchParams) : nextInit,
      );
      navigate('?' + newSearchParams, {replace: true});
    },
    [navigate, searchParams],
  );

  return [searchParams, setSearchParams];
}

interface HikeGroupProps {
  groupName: string;
  peaks: readonly Peak[];
  selectedPeaks: readonly Peak[];
  onSelectPeaks: (peaks: readonly Peak[]) => void;
  onDeselectPeaks: (peaks: readonly Peak[]) => void;
}

function HikeGroup(props: HikeGroupProps) {
  const {groupName, peaks, selectedPeaks, onSelectPeaks, onDeselectPeaks} = props;
  const checkRef = React.useRef<HTMLInputElement>(null);
  const numChecked = peaks.filter(peak => selectedPeaks.includes(peak)).length;
  const isIndeterminate = numChecked > 0 && numChecked < peaks.length;

  React.useEffect(() => {
    if (checkRef.current) {
      checkRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, checkRef]);

  // Toggle all from an indeterminate state is "check all": https://ux.stackexchange.com/q/92070
  const toggleAll = React.useCallback(() => {
    if (numChecked === peaks.length) {
      onDeselectPeaks(peaks);
    } else {
      onSelectPeaks(peaks);
    }
  }, [numChecked, onDeselectPeaks, onSelectPeaks, peaks]);

  const toggleOnePeak = React.useCallback<React.ChangeEventHandler>(
    e => {
      const peak = e.target.id as keyof typeof PEAKS;
      if (selectedPeaks.includes(peak)) {
        onDeselectPeaks([peak]);
      } else {
        onSelectPeaks([peak]);
      }
    },
    [onDeselectPeaks, onSelectPeaks, selectedPeaks],
  );

  return (
    <div className="peak-group">
      <label>
        <input
          checked={numChecked === peaks.length}
          ref={checkRef}
          type="checkbox"
          onChange={toggleAll}
        />{' '}
        <b>{groupName}</b>
      </label>
      <div className="peak-group-peaks">
        {peaks.map(code => (
          <React.Fragment key={code}>
            <label>
              <input
                checked={selectedPeaks.includes(code)}
                id={code}
                type="checkbox"
                onChange={toggleOnePeak}
              />{' '}
              {PEAKS[code]}
            </label>
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const EMPTY_SINGLETON: never[] = [];

// TODO: load hikes automatically on page load (and add some kind of server cache)
export function HikePlanner() {
  const [searchParams, setSearchParams] = useLightlyEncodedSearchParams();
  const peaksParam = searchParams.get('peaks');
  const peaks = (
    peaksParam === null
      ? ALL_PEAKS
      : peaksParam === ''
      ? EMPTY_SINGLETON
      : peaksParam.split(',')
  ) as Peak[];
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

  const onSelectPeaks = React.useCallback(
    (newlySelectedPeaks: readonly Peak[]) => {
      const peaksToSet = newlySelectedPeaks.filter(p => !peaks.includes(p));
      setPeaks(peaks.concat(peaksToSet));
    },
    [peaks, setPeaks],
  );
  const onDeselectPeaks = React.useCallback(
    (newlyDeselectedPeaks: readonly Peak[]) => {
      const newPeaks = peaks.filter(p => !newlyDeselectedPeaks.includes(p));
      setPeaks(newPeaks);
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

  const CHECK_PROPS = {
    selectedPeaks: peaks,
    onSelectPeaks,
    onDeselectPeaks,
  };

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
        <button disabled={proposedHikes?.state === 'loading'} onClick={search}>
          {proposedHikes?.state !== 'loading' ? 'Find Hikes' : 'Searching…'}
        </button>
        {proposedHikes ? (
          <div className="proposed-hikes">
            {proposedHikes.state === 'loading' ? (
              'Finding some great hikes for you, be patient.'
            ) : proposedHikes.state === 'error' ? (
              `Error: ${proposedHikes.error}`
            ) : (
              <ProposedHikesList plan={proposedHikes.data} />
            )}
          </div>
        ) : null}
        <hr />
        Select: <button onClick={selectAll}>All</button>{' '}
        <button onClick={selectNone}>None</button>
        <br />
        <HikeGroup
          groupName="Slide Mountain Wilderness"
          peaks={SLIDE_PEAKS}
          {...CHECK_PROPS}
        />
        <HikeGroup
          groupName="Big Indian Wilderness"
          peaks={BIG_INDIAN_PEAKS}
          {...CHECK_PROPS}
        />
        <HikeGroup groupName="Spruceton Valley" peaks={SPRUCETON_PEAKS} {...CHECK_PROPS} />
        <HikeGroup groupName="Platte Clove" peaks={PLATTE_CLOVE_PEAKS} {...CHECK_PROPS} />
        <HikeGroup
          groupName="Windham Blackhead Range"
          peaks={WINDHAM_BLACKHEAD_PEAKS}
          {...CHECK_PROPS}
        />
        <HikeGroup groupName="Bearpen State Forest" peaks={BEARPEN_PEAKS} {...CHECK_PROPS} />
      </div>
      <HikePlannerMap
        hikes={proposedHikes?.state === 'ok' ? proposedHikes.data.solution.features : null}
        peaks={peaks}
      />
    </div>
  );
}

// See https://stackoverflow.com/a/33542499/388951
function saveFile(filename: string, data: string) {
  const blob = new Blob([data], {type: 'text/csv'});
  const elem = window.document.createElement('a');
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
}

interface ProposedHikesProps {
  plan: HikePlannerResponse;
}

const ZWSP = '​';

function getHikeName(
  nodes: number[],
  idToCode: Record<string, string>,
  idToLot: Record<string, string>,
) {
  const lot1 = nodes[0];
  const lot2 = nodes.at(-1)!;
  const peaks = nodes.slice(1, -1);
  const sortedPeaks = _.sortBy(peaks.map(id => idToCode[id])).join(',');
  const peakStr =
    PEAKS_TO_NAME[sortedPeaks] ??
    peaks.map(id => SHORT_PEAKS[idToCode[id] as Peak]).join(ZWSP + '→' + ZWSP);
  const lot1s = idToLot[lot1];
  if (lot1 === lot2) {
    return `${peakStr} from ${lot1s}`;
  }
  const lot2s = idToLot[lot2];
  return `${peakStr} from ${lot1s}${ZWSP}→${ZWSP}${lot2s}`;
}

function ProposedHikesList(props: ProposedHikesProps) {
  const {plan} = props;
  const {solution, peak_ids} = plan;
  const idToCode = _.fromPairs(peak_ids.map(([code, id]) => [id, code]));
  const idToLot: Record<string, string> = {};
  for (const f of solution.features) {
    const {properties} = f;
    if (properties?.type === 'parking-lot') {
      idToLot[properties.id] = properties.name;
    }
  }

  const downloadHike = (hikeIdx: number) => {
    const gpx = generateGpxForHike(solution, hikeIdx);
    saveFile('hike.gpx', gpx);
  };

  return (
    <div className="proposed-hikes">
      <hr />
      {solution.num_hikes} hikes, {solution.d_mi.toFixed(1)} miles.
      <ol>
        {plan.solution.hikes.map((hike, i) => (
          <li key={i}>
            {(hike[0] * 0.621371).toFixed(1)} mi: {getHikeName(hike[1], idToCode, idToLot)} (
            <a href="#" onClick={() => downloadHike(i)}>
              GPX
            </a>
            )
          </li>
        ))}
      </ol>
    </div>
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

// See https://stackoverflow.com/a/27979933/388951
function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
    throw new Error();
  });
}

function generateGpxForHike(solution: HikePlannerResponse['solution'], hikeIdx: number) {
  const hikeFeature = solution.features.find(f => f.properties?.hike_index === hikeIdx);
  if (!hikeFeature) {
    throw new Error();
  }

  const trkPts = getCoordinates(hikeFeature.geometry).map(
    ([lng, lat]) => `<trkpt lat="${lat}" lon="${lng}"></trkpt>`,
  );

  return `<?xml version="1.0"?>
  <gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" creator="AllTrails.com" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
    <metadata>
      <name><![CDATA[Hike title]]></name>
      <desc><![CDATA[Hike description]]></desc>
      <link href="${escapeXml(location.href)}">
        <text>DanVK's Catskills Hike Planner</text>
      </link>
    </metadata>
    <trk>
      <name><![CDATA[Hike Name]]></name>
      <src>DanVK's Catskills Hike Planner</src>
      <trkseg>
        ${trkPts.join('\n')}
      </trkseg>
    </trk>
  </gpx>
  `;
}

function getCoordinates(geom: Geometry) {
  if (geom.type === 'Point') {
    return [geom.coordinates];
  } else if (geom.type === 'LineString') {
    return geom.coordinates;
  } else if (geom.type === 'MultiLineString') {
    return _.flatten(geom.coordinates);
  }

  throw new Error(`Surprise geometry type: ${geom.type}`);
}

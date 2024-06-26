import './HikePlanner.css';

import {Feature, FeatureCollection, Geometry} from 'geojson';
import _ from 'lodash';
import React from 'react';
import Map, {Layer, Source} from 'react-map-gl';
import {useLocation, useNavigate} from 'react-router-dom';

import {EMPTY_FC, MAPBOX_TOKEN, MountainPeaks, parkStyle} from './HikeMap';
import {FT_PER_M, MI_PER_KM} from './constants';
import {AREAS, HikingArea, HikingAreaCode, Peak} from './peak-data';

const MODES = ['unrestricted', 'loops-only', 'prefer-loop'] as const;
type Mode = (typeof MODES)[number];

const MODE_NAMES: Record<Mode, string> = {
  unrestricted: 'Allow Through Hikes',
  'loops-only': 'Only Loop Hikes',
  'prefer-loop': 'Prefer Loop Hikes',
};

interface HikePlannerRequest {
  area: HikingAreaCode;
  max_len_km: number;
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

const PA_SHORT_NAMES = {
  233883906: 'MacDaniel Rd',
  156124291: 'Elm Ridge PA',
  2948008322: 'Condon Hollow Rd',
  8072809861: 'Shaft Rd',
  2897918982: 'South Side Spur',
  816358666: 'Giant Ledge PA',
  816358667: 'Slide Mountain PA',
  7556678796: 'Winter Clove Rd',
  909115024: 'Hunter North Picnic Area',
  818552593: "Devil's Tombstone",
  921890834: 'Circle W General Store',
  899027859: 'Mink Hollow Rd S',
  2910242580: 'Spruceton Rd',
  995422357: 'Spruceton Rd',
  10960189335: 'Barnum Rd',
  2946719128: 'Dry Brook Trailhead PA',
  7609349908: 'Moon Haw Rd',
  9217245722: 'Platte Clove Rd',
  1096163099: 'MacDaniel Rd',
  8072997146: 'Halcott Falls PA',
  826537380: 'Woodland Valley',
  1273010086: 'Steenburg Rd',
  256332838: 'Overlook Upper PA',
  2948047400: 'Heisinger Rd',
  2946665517: 'Hill Rd',
  2426235822: 'Big Hollow Rd',
  1273001263: 'Prediger Rd',
  2897919153: 'Mill Brook Rd',
  290543156: 'Belleayre Day Use Area',
  2898347829: 'Kelly Hollow Ski Trail',
  2940748598: 'Lost Clove Rd',
  2939238969: 'Ploutz Rd',
  2910254266: 'Spruceton Rd',
  2426235833: 'Peck Rd',
  4256942140: 'North Lake',
  2898347834: 'Kelly Hollow Ski Trail',
  4256942142: 'North Lake Rd',
  842259390: 'Colgate Rd',
  2948031554: 'County Rd 3 (North)',
  2947971907: 'McKenley Hollow',
  10091139141: 'Diamond Notch PA',
  1118944455: 'Jesop Rd',
  1075850833: 'Spruceton Horse Trail',
  856841086: "Devil's Tombstone (S)",
  515079893: 'North Lake',
  338567127: 'Lane Rd',
  1329053915: 'Storks Nest Rd',
  286143196: 'Balsam Lake Trail PA',
  231407451: 'Denning PA',
  280416604: 'Rider Hollow',
  2948020833: 'County Rd 3',
  256331746: 'Belleayre Lot A',
  2898368482: 'Black Bear Rd',
  2908401254: 'Gillespie Rd',
  2908401255: 'Cortina Ln',
  7833211113: 'Mink Hollow',
  2442957547: 'Biscuit Brook PA',
  132056300: 'Peekamoose PA',
  2422040557: 'Notch Inn Rd',
  385488236: 'Lane Street',
  385488238: 'Plank Rd',
  238522992: 'Roaring Kill',
  385488241: 'Plank Rd',
  10942786419: 'Burnham Hollow',
  834705779: 'Fox Hollow PA',
  854537976: 'Scutt Rd PA',
  2948008318: 'Elk Creek Rd',
};

interface HikePlannerResponse {
  solution: {
    d_km: number;
    d_mi: number;
    num_hikes: number;
    hikes: [number, number, number[]][];
    features: Feature[];
  };
  peak_ids: [Peak, number, string][];
}

const ENDPOINT = 'https://qa0q1ij69f.execute-api.us-east-1.amazonaws.com/find-hikes';
// const ENDPOINT = 'http://localhost:5000/find-hikes';

async function getHikes(req: HikePlannerRequest): Promise<HikePlannerResponse> {
  const r = await fetch(ENDPOINT, {
    method: 'post',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!r.ok) {
    let text;
    try {
      const body = await r.json();
      if (body.message) {
        text = body.message;
      }
    } catch {
      text = 'Error';
    }
    throw new Error(`${r.statusText}: ${text}`);
  }
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
  peakNames: Record<string, string>;
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
      const peak = e.target.id as Peak;
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
              {props.peakNames[code]}
            </label>
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const EMPTY_SINGLETON: never[] = [];

interface HikeAreaLinkProps {
  displayName: string;
  code: HikingAreaCode;
  isSelected: boolean;
  onClick: (code: HikingAreaCode) => void;
}

function HikeAreaLink(props: HikeAreaLinkProps) {
  const {isSelected} = props;
  const className = 'hike-area' + (isSelected ? ' selected' : '');
  const onClick = isSelected ? undefined : () => props.onClick(props.code);
  return (
    <div className={className} onClick={onClick}>
      {props.displayName}
    </div>
  );
}

// TODO: load hikes automatically on page load (and add some kind of server cache)
export function HikePlanner() {
  const [searchParams, setSearchParams] = useLightlyEncodedSearchParams();
  const area = (searchParams.get('area') ?? 'catskills') as HikingAreaCode;
  const spec = AREAS.find(a => a.code === area)!;
  const maxMi = Number(searchParams.get('max_mi') ?? 18);
  const peaksParam = searchParams.get('peaks');
  const peaks = (
    peaksParam === null
      ? spec.all_peaks
      : peaksParam === ''
      ? EMPTY_SINGLETON
      : peaksParam.split(',')
  ) as Peak[];
  const mode = (searchParams.get('mode') ?? 'loops-only') as Mode;

  const setArea = React.useCallback(
    (area: HikingAreaCode) => {
      setProposedHikes(null);
      setSelectedHikeIndex(null);
      setSearchParams({mode, area, max_mi: String(maxMi)}); // drop peaks
    },
    [mode, maxMi, setSearchParams],
  );

  const setPeaks = React.useCallback(
    (newPeaks: string[]) => {
      setSearchParams({peaks: newPeaks.join(','), mode, area, max_mi: String(maxMi)});
    },
    [area, mode, maxMi, setSearchParams],
  );
  const setMode = React.useCallback(
    (newMode: Mode) => {
      setSearchParams({peaks: peaks.join(','), mode: newMode, area, max_mi: String(maxMi)});
    },
    [area, peaks, maxMi, setSearchParams],
  );
  const setMaxMi = React.useCallback(
    (maxMi: number) => {
      setSearchParams({peaks: peaks.join(','), mode, area, max_mi: String(maxMi)});
    },
    [area, peaks, mode, setSearchParams],
  );

  const handleChangeMaxMi = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMaxMi(e.currentTarget.valueAsNumber);
    },
    [setMaxMi],
  );

  const selectAll = React.useCallback(() => {
    setPeaks(spec.all_peaks);
  }, [spec, setPeaks]);
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
      const maxKm = maxMi / MI_PER_KM;
      const r: HikePlannerRequest = {peaks, mode, area, max_len_km: maxKm};
      setProposedHikes({state: 'loading'});
      try {
        const proposals = await getHikes(r);
        // TODO: invalidate when there's a new query
        setProposedHikes({state: 'ok', data: proposals});
      } catch (e) {
        setProposedHikes({state: 'error', error: e});
      }
    })();
  }, [peaks, area, mode, maxMi]);

  const [selectedHikeIndex, setSelectedHikeIndex] = React.useState<number | null>(null);

  const CHECK_PROPS = {
    selectedPeaks: peaks,
    onSelectPeaks,
    onDeselectPeaks,
  };

  const isValid = peaks.length > 0 && maxMi >= 5 && maxMi <= 30;

  return (
    <div className="App hike-planner">
      <div className="hike-control-panel">
        <div className="area-selector">
          {AREAS.map(a => (
            <HikeAreaLink
              key={a.code}
              code={a.code}
              onClick={setArea}
              displayName={a.displayName}
              isSelected={a.code === area}
            />
          ))}
        </div>
        <div className="hike-option">
          <label htmlFor="hike-mode">Style:</label>
          <select
            id="hike-mode"
            value={mode}
            onChange={e => setMode(e.currentTarget.value as Mode)}>
            {MODES.map(m => (
              <option key={m} value={m}>
                {MODE_NAMES[m]}
              </option>
            ))}
          </select>
        </div>
        <div className="hike-option">
          <label htmlFor="max-len">Max:</label>
          <input
            id="max-len"
            type="number"
            value={maxMi}
            onChange={handleChangeMaxMi}
            min={5}
            max={30}
          />{' '}
          mi
          {maxMi < 5 ? (
            <span className="error">Must be &gt;= 5 mi</span>
          ) : maxMi > 30 ? (
            <span className="error">Must be &lt;= 30 mi</span>
          ) : null}
        </div>
        <button disabled={proposedHikes?.state === 'loading' || !isValid} onClick={search}>
          {proposedHikes?.state !== 'loading' ? 'Find Hikes' : 'Searching…'}
        </button>
        {proposedHikes ? (
          <div className="proposed-hikes">
            {proposedHikes.state === 'loading' ? (
              'Finding some great hikes for you, be patient.'
            ) : proposedHikes.state === 'error' ? (
              `Error: ${proposedHikes.error}`
            ) : (
              <ProposedHikesList
                plan={proposedHikes.data}
                selectedHikeIndex={selectedHikeIndex}
                onSelectHike={setSelectedHikeIndex}
              />
            )}
          </div>
        ) : null}
        <hr />
        Select: <button onClick={selectAll}>All</button>{' '}
        <button onClick={selectNone}>None</button>
        <br />
        {spec.ranges.map((range, i) => (
          <HikeGroup
            groupName={range.areaName}
            key={i}
            peakNames={spec.peaks}
            peaks={range.peaks}
            {...CHECK_PROPS}
          />
        ))}
      </div>
      <HikePlannerMap
        hikes={proposedHikes?.state === 'ok' ? proposedHikes.data.solution.features : null}
        peaks={peaks}
        spec={spec}
        selectedHikeIndex={selectedHikeIndex}
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

const ZWSP = '​';

// TODO: idToCode and codeToName feels pretty roundabout
function getHikeName(
  nodes: number[],
  idToCode: Record<string, string>,
  idToLot: Record<string, string>,
  codeToName: Record<string, string>,
) {
  const lot1 = nodes[0];
  const lot2 = nodes.at(-1)!;
  const peaks = nodes.slice(1, -1);
  const sortedPeaks = _.sortBy(peaks.map(id => idToCode[id])).join(',');
  const peakStr =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    PEAKS_TO_NAME[sortedPeaks] ??
    peaks
      .map(id => shortPeakName(codeToName[idToCode[id]]))
      .join(ZWSP + (peaks.length > 2 ? '→' : '/') + ZWSP);
  const lot1s = idToLot[lot1];
  if (lot1 === lot2) {
    return (
      <>
        <b>{peakStr}</b>
        <br />
        from {lot1s}
      </>
    );
  }
  const lot2s = idToLot[lot2];
  return (
    <>
      <b>{peakStr}</b>
      <br />
      from {lot1s}
      {ZWSP}→{ZWSP}
      {lot2s}
    </>
  );
}

// This is "book time", a variation on Naismith's Rule. See
// https://adventurenerds.com/article/hiking-time-calculator-and-how-to-estimate-hiking-time/
function hikeTimeHours(km: number, eleM: number) {
  return Math.round((km * MI_PER_KM) / 2 + (eleM * FT_PER_M) / 2000);
}

interface ProposedHikesProps {
  plan: HikePlannerResponse;
  selectedHikeIndex: number | null;
  onSelectHike: (selectedHikeIndex: number | null) => void;
}

function ProposedHikesList(props: ProposedHikesProps) {
  const {plan, selectedHikeIndex, onSelectHike} = props;
  const {solution, peak_ids} = plan;
  const idToCode = _.fromPairs(peak_ids.map(([code, id]) => [id, code]));
  const idToLot: Record<string, string> = {};
  const codeToName = _.fromPairs(peak_ids.map(([code, _id, name]) => [code, name]));
  for (const f of solution.features) {
    const {properties} = f;
    if (properties?.type === 'parking-lot') {
      idToLot[properties.id] = properties.name;
    }
  }
  for (const [id, name] of Object.entries(PA_SHORT_NAMES)) {
    idToLot[id] = name;
  }

  const downloadHike = (hikeIdx: number) => {
    const gpx = generateGpxForHike(solution, hikeIdx);
    saveFile('hike.gpx', gpx);
  };
  const {hikes} = plan.solution;
  const sortedHikeIndices = _.sortBy(_.range(0, hikes.length), i => -hikes[i][0]);

  return (
    <div className="proposed-hikes">
      <hr />
      {solution.num_hikes} hikes, {solution.d_mi.toFixed(1)} miles.
      <ol>
        {sortedHikeIndices.map(i => (
          <li
            className={i === selectedHikeIndex ? 'selected' : ''}
            key={i}
            onMouseEnter={() => onSelectHike(i)}
            onMouseLeave={() => onSelectHike(null)}>
            {getHikeName(hikes[i][2], idToCode, idToLot, codeToName)}
            <br />
            {(hikes[i][0] * MI_PER_KM).toFixed(1)}mi +
            {Math.round(hikes[i][1] * FT_PER_M).toLocaleString()}ft ~
            {hikeTimeHours(hikes[i][0], hikes[i][1])}h
            {i === selectedHikeIndex ? (
              <>
                {' '}
                (
                <a href="#" onClick={() => downloadHike(i)}>
                  ↓ GPX
                </a>
                )
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

interface HikePlannerMapProps {
  peaks: Peak[];
  spec: HikingArea;
  hikes: Feature[] | null;
  selectedHikeIndex: number | null;
}

const parkingLotStyle = {
  type: 'symbol',
  layout: {
    'icon-image': 'parking',
    'icon-allow-overlap': true,
  },
} satisfies Partial<mapboxgl.AnyLayer>;

function HikePlannerMap(props: HikePlannerMapProps) {
  const {spec, peaks, hikes, selectedHikeIndex} = props;
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
  const hikeStyle = React.useMemo(
    () =>
      ({
        type: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'hike_index'], selectedHikeIndex],
            'darkblue',
            'rgb(28,109,163)',
          ],
          'line-width': ['case', ['==', ['get', 'hike_index'], selectedHikeIndex], 6, 3],
        },
      } satisfies Partial<mapboxgl.AnyLayer>),
    [selectedHikeIndex],
  );

  return (
    <div id="map">
      <Map
        key={spec.code}
        initialViewState={spec.initialViewState}
        mapStyle="mapbox://styles/danvk/clf7a8rz5001j01qerupylm4t"
        mapboxAccessToken={MAPBOX_TOKEN}>
        <Source data={spec.boundaryGeoJSON} id="catskill-park" type="geojson">
          <Layer id="catskill-park" {...parkStyle} />
        </Source>
        <Source data={hikeFeatures} id="hikes" type="geojson">
          <Layer id="hikes" {...hikeStyle} />
        </Source>
        <Source data={parkingLotFeatures} id="lots" type="geojson">
          <Layer id="lots" {...parkingLotStyle} />
        </Source>
        <MountainPeaks
          peaksGeoJSON={spec.peaksGeoJSON}
          hiked={peaks.map(p => shortPeakName(spec.peaks[p]))}
        />
      </Map>
    </div>
  );
}

function shortPeakName(long: string) {
  // Matches generate_web_data.py in computing-in-the-catskills
  return long
    .replace(' High Point', '')
    .replace(' High Peak', '')
    .replace(' Mountain', '')
    .replace('Mount ', '')
    .replace(' Peak', '');
}

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
  <gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" creator="danvk.org/catskills" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
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

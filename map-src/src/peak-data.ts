import {ViewState} from 'react-map-gl';

const CATSKILLS_PEAKS = {
  S: 'Slide Mountain',
  H: 'Hunter Mountain',
  BD: 'Black Dome Mountain',
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
  RT: 'Roundtop',
  D: 'Doubletop - South',
  MR: 'Millbrook Ridge',
  DB: 'Dry Brook Ridge',
};

const ADK_PEAKS = {
  Gi: 'Giant Mountain',
  Mb: 'Macomb Mountain',
  SD: 'South Dix',
  ED: 'Grace Peak',
  B: 'Basin Mountain',
  D: 'Dix Mountain',
  BS: 'Big Slide Mountain',
  Sa: 'Saddleback Mountain',
  WF: 'Whiteface Mountain',
  LW: 'Lower Wolfjaw Mountain',
  A: 'Algonquin Peak',
  Sk: 'Mount Skylight',
  St: 'Street Mountain',
  Em: 'Mount Emmons',
  Sy: 'Seymour Mountain',
  Wr: 'Wright Peak',
  Ar: 'Armstrong Mountain',
  UW: 'Upper Wolfjaw Mountain',
  Do: 'Donaldson Mountain',
  P: 'Panther Peak',
  Cl: 'Cliff Mountain',
  Ny: 'Nye Mountain',
  Re: 'Mount Redfield',
  SP: 'Santanoni Peak',
  Ph: 'Phelps Mountain',
  G: 'Gray Peak',
  T: 'Table Top Mountain',
  Bl: 'Blake Peak',
  Co: 'Mount Colvin',
  Ca: 'Cascade Mountain',
  E: 'Esther Mountain',
  Se: 'Seward Mountain',
  H: 'Mount Haystack',
  RP: 'Rocky Peak Ridge',
  Go: 'Gothics',
  Al: 'Allen Mountain',
  Ho: 'Hough Peak',
  N: 'Nippletop',
  DL: 'Dial Mountain',
  C: 'Mount Colden',
  MM: 'Mount Marshall',
  Cu: 'Couchsachraga Peak',
  Sw: 'Sawteeth',
  M: 'Mount Marcy',
  Po: 'Porter Mountain',
  I: 'Iroquois Peak',
};

export type Peak = keyof typeof CATSKILLS_PEAKS | keyof typeof ADK_PEAKS;

export interface MountainRange {
  areaName: string;
  peaks: readonly Peak[];
}

export const ADK_RANGES: MountainRange[] = [
  {
    areaName: 'Marcy Group',
    peaks: ['M', 'H', 'Sk', 'G', 'C', 'Re', 'Al', 'Cl'],
  },
  {
    areaName: 'MacIntyre',
    peaks: ['A', 'I', 'Wr', 'MM'],
  },
  {
    areaName: 'Whiteface Mountain Area',
    peaks: ['WF', 'E'],
  },
  {
    areaName: 'Dix Range',
    peaks: ['D', 'Mb', 'Ho', 'SD', 'ED'],
  },
  {
    areaName: 'Great Range',
    peaks: ['B', 'Go', 'Sa', 'Ar', 'UW', 'LW', 'Sw'],
  },
  {
    areaName: 'Giant Range',
    peaks: ['Gi', 'RP'],
  },
  {
    areaName: 'Colvin Range',
    peaks: ['N', 'Co', 'DL', 'Bl'],
  },
  {
    areaName: 'Northern High Peaks',
    peaks: ['T', 'BS', 'Ph', 'Ca', 'Po'],
  },
  {
    areaName: 'Santanoni Range',
    peaks: ['SP', 'P', 'Cu'],
  },
  {
    areaName: 'Seward Range',
    peaks: ['Se', 'Do', 'Sy', 'Em'],
  },
];

const CATSKILLS_ALT_PEAKS: Peak[] = ['MR', 'DB', 'D', 'RT'];

export const CATSKILLS_RANGES: MountainRange[] = [
  {
    areaName: 'Slide Mountain Wilderness',
    peaks: ['S', 'C', 'Ta', 'Pk', 'W', 'L', 'P', 'BC', 'Fr', 'Ro'],
  },
  {areaName: 'Big Indian Wilderness', peaks: ['BL', 'BI', 'Fi', 'B', 'E']},
  {areaName: 'Spruceton Valley', peaks: ['H', 'We', 'SW', 'Ru', 'ND', 'Sh', 'Ha']},
  {areaName: 'Platte Clove', peaks: ['Pl', 'Su', 'KHP', 'Tw', 'IH']},
  {areaName: 'Windham Blackhead Range', peaks: ['BD', 'BH', 'TC', 'WHP']},
  {areaName: 'Bearpen State Forest', peaks: ['Bp', 'V']},
  {areaName: 'Alternate Peaks', peaks: CATSKILLS_ALT_PEAKS},
];

export type HikingAreaCode = 'catskills' | 'adk';

export interface HikingArea {
  code: HikingAreaCode;
  displayName: string;
  peaks: Record<string, string>;
  all_peaks: string[];
  ranges: MountainRange[];
  initialViewState: Pick<ViewState, 'latitude' | 'longitude' | 'zoom'>;
  boundaryGeoJSON: string;
  peaksGeoJSON: string;
}

export const AREAS: HikingArea[] = [
  {
    code: 'catskills',
    displayName: 'Catskills',
    peaks: CATSKILLS_PEAKS,
    all_peaks: Object.keys(CATSKILLS_PEAKS).filter(
      code => !CATSKILLS_ALT_PEAKS.includes(code as Peak),
    ), // here for reference equality
    ranges: CATSKILLS_RANGES,
    initialViewState: {
      latitude: 42.0922169187148,
      longitude: -74.36398700976565,
      zoom: 10,
    },
    boundaryGeoJSON: '/catskills/map/catskill-park.geojson',
    peaksGeoJSON: '/catskills/map/catskills-high-peaks.geojson',
  },
  {
    code: 'adk',
    displayName: 'Adirondacks',
    peaks: ADK_PEAKS,
    all_peaks: Object.keys(ADK_PEAKS), // here for reference equality
    ranges: ADK_RANGES,
    initialViewState: {
      latitude: 44.1957,
      longitude: -73.9867,
      zoom: 10,
    },
    boundaryGeoJSON: '/catskills/map/adk-park.geojson',
    peaksGeoJSON: '/catskills/map/adk-high-peaks.geojson',
  },
];

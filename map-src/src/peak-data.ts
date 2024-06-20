export const PEAKS = {
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
export type Peak = keyof typeof PEAKS;
export const ALL_PEAKS = Object.keys(PEAKS) as Peak[];

export interface HikeArea {
  areaName: string;
  peaks: readonly Peak[];
}

export const HIKE_AREAS: HikeArea[] = [
  {
    areaName: 'Adirondacks',
    peaks: Object.keys(PEAKS) as Peak[],
  },
];

/*
export const HIKE_AREAS: HikeArea[] = [
  {
    areaName: 'Slide Mountain Wilderness',
    peaks: ['S', 'C', 'Ta', 'Pk', 'W', 'L', 'P', 'BC', 'Fr', 'Ro'],
  },
  {areaName: 'Big Indian Wilderness', peaks: ['BL', 'BI', 'Fi', 'B', 'E']},
  {areaName: 'Spruceton Valley', peaks: ['H', 'We', 'SW', 'Ru', 'ND', 'Sh', 'Ha']},
  {areaName: 'Platte Clove', peaks: ['Pl', 'Su', 'KHP', 'Tw', 'IH']},
  {areaName: 'Windham Blackhead Range', peaks: ['BD', 'BH', 'TC', 'WHP']},
  {areaName: 'Bearpen State Forest', peaks: ['Bp', 'V']},
];
*/

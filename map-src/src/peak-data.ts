export const PEAKS = {
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
export type Peak = keyof typeof PEAKS;
export const ALL_PEAKS = Object.keys(PEAKS) as Peak[];

export interface HikeArea {
  areaName: string;
  peaks: readonly Peak[];
}

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

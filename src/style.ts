// https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/

export const trackStyle = {
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": [
      "match",
      ["get", "season"],
      "winter",
      "white",
      "spring",
      "limegreen",
      "summer",
      "green",
      "fall",
      "orange",
      "green",
    ],
    "line-width": 4
  },
} satisfies Partial<mapboxgl.AnyLayer>;

export const trackStyleSelected = {
  ...trackStyle,
  paint: {
    ...trackStyle.paint,
    "line-width": [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      6,
      0
    ],
  },
} satisfies Partial<mapboxgl.AnyLayer>;

export const trackStyleSelectedOutline = {
  ...trackStyle,
  paint: {
    'line-color': 'gray',
    "line-width": [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      8,
      0
    ],
  },
} satisfies Partial<mapboxgl.AnyLayer>;

export const peakTypeColor: mapboxgl.Expression = [
  "match",
  ["get", "type"],
  "dec",
  "darkgreen",
  "trail",
  "brown",
  "bushwhack",
  "red",
  "closed",
  "pink",
  "black",
];


export const parkStyle = {
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": 'brown',
    "line-width": 1
  },
} satisfies Partial<mapboxgl.AnyLayer>;

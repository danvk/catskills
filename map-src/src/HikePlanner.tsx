import React from "react";
import Map, { Layer, Source, useMap } from "react-map-gl";
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
const ALL_PEAKS = Object.keys(PEAKS) as (keyof typeof PEAKS)[];

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

  const search = React.useCallback(() => {
    console.log(peaks);
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

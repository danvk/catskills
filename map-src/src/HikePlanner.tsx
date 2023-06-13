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

export function HikePlanner() {
  const [peaks, setPeaks] = React.useState(Object.keys(PEAKS));

  const selectAll = React.useCallback(() => {
    setPeaks(Object.keys(PEAKS));
  }, []);
  const selectNone = React.useCallback(() => {
    setPeaks([]);
  }, []);
  const selectInvert = React.useCallback(() => {
    setPeaks(oldPeaks => Object.keys(PEAKS).filter(code => oldPeaks.includes(code)));
  }, []);
  const togglePeak = React.useCallback<React.ChangeEventHandler>(e => {
    const peak = e.target.id;
    setPeaks(oldPeaks => oldPeaks.includes(peak) ? oldPeaks.filter(p => p !== peak) : oldPeaks.concat([peak]));
  }, []);

  const search = React.useCallback(() => {
    console.log(peaks);
  }, [peaks]);

  return (
    <div className="App hike-planner">
      <div className="hike-control-panel">
        <button onClick={selectAll}>All</button>
        <button onClick={selectNone}>None</button>
        <button onClick={selectInvert}>Invert</button><br/>
        <button onClick={search}>Find Hikes</button><br/>
        {Object.entries(PEAKS).map(([code, displayName]) => (
          <React.Fragment key={code}>
            <label>
            <input type="checkbox" checked={(() => { console.log(code, peaks.includes(code)); return peaks.includes(code); })()} id={code} onChange={togglePeak} />
            {' '}{displayName}
            </label>
            <br />
          </React.Fragment>
        ))}
      </div>
      <HikePlannerMap peaks={peaks} />
    </div>
  );
}

function HikePlannerMap(props: {peaks: string[]}) {
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
        <MountainPeaks hiked={props.peaks} />
      </Map>
    </div>
  );
}

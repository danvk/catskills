import './App.css';

import {useQuery} from '@tanstack/react-query';
import {FeatureCollection, LineString} from 'geojson';
import React from 'react';
import {Route, Routes, useSearchParams} from 'react-router-dom';

import {fetchJSON} from './fetch';
import {HikeInfoPanel, ScrubPoint, TrackProps} from './HikeInfoPanel';
import {Hike, HikeList} from './HikeList';
import {HikeMap} from './HikeMap';
import {HikePlanner} from './HikePlanner';

function App() {
  return (
    <Routes>
      <Route element={<HikePage />} path="/catskills/map" />
      <Route element={<HikePlanner />} path="/catskills/map/planner" />
    </Routes>
  );
}

function HikePage() {
  const hikeResource = useQuery({
    queryKey: ['log.json'],
    queryFn: fetchJSON<Hike[]>,
  });
  const tracksResource = useQuery({
    queryKey: ['tracks.geojson'],
    queryFn: fetchJSON<FeatureCollection<LineString, TrackProps>>,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedHikeSlug = searchParams.get('hike');
  const handleSelectHike = React.useCallback(
    (hike: string | null) => {
      setSearchParams(hike ? {hike} : {});
    },
    [setSearchParams],
  );

  const [scrubPoint, setScrubPoint] = React.useState<ScrubPoint | null>(null);

  return (
    <div className="App">
      <HikeList
        hikes={hikeResource}
        selectedHikeSlug={selectedHikeSlug}
        onSelectHike={handleSelectHike}
      />
      <HikeMap
        peaksGeoJSON="/catskills/map/catskills-high-peaks.geojson"
        hikes={hikeResource}
        scrubPoint={scrubPoint}
        selectedHikeSlug={selectedHikeSlug}
        tracks={tracksResource}
        onSelectHike={handleSelectHike}
      />
      {selectedHikeSlug &&
      tracksResource.status === 'success' &&
      hikeResource.status === 'success' ? (
        <HikeInfoPanel
          hike={hikeResource.data.find(hike => hike.slug === selectedHikeSlug)!}
          key={selectedHikeSlug}
          scrubPoint={scrubPoint}
          selectedHikeSlug={selectedHikeSlug}
          trackFeatureProps={tracksResource.data.features
            .map(f => f.properties)
            .filter(p => p.slug === selectedHikeSlug)}
          onChangeSelectedHike={handleSelectHike}
          onScrubPoint={setScrubPoint}
        />
      ) : null}
    </div>
  );
}

export default App;

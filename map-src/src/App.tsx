import "./App.css";

import { useQuery } from "@tanstack/react-query";
import { Routes, Route, useSearchParams } from "react-router-dom";

import { fetchJSON } from "./fetch";
import { Hike, HikeList } from "./HikeList";
import { HikeMap } from "./HikeMap";
import React from "react";
import { HikeInfoPanel, TrackProps } from "./HikeInfoPanel";
import { FeatureCollection, LineString } from "geojson";

function App() {
  return (
    <Routes>
      <Route path="/catskills/map" element={<HikePage />}></Route>
    </Routes>
  );
}

function HikePage() {
  const hikeResource = useQuery({
    queryKey: ["log.json"],
    queryFn: fetchJSON<Hike[]>,
  });
  const tracksResource = useQuery({
    queryKey: ["tracks.geojson"],
    queryFn: fetchJSON<FeatureCollection<LineString, TrackProps>>,
  })

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedHikeSlug = searchParams.get("hike");
  const handleSelectHike = React.useCallback((hike: string) => {
    setSearchParams({ hike });
  }, []);

  return (
    <div className="App">
      <HikeList
        hikes={hikeResource}
        selectedHikeSlug={selectedHikeSlug}
        onSelectHike={handleSelectHike}
      />
      <HikeMap
        hikes={hikeResource}
        tracks={tracksResource}
        selectedHikeSlug={selectedHikeSlug}
        onSelectHike={handleSelectHike}
      />
      {selectedHikeSlug && tracksResource.status === "success" && hikeResource.status === 'success' ? (
        <HikeInfoPanel
          selectedHikeSlug={selectedHikeSlug}
          hike={hikeResource.data.find(hike => hike.slug === selectedHikeSlug)!}
          trackFeatureProps={tracksResource.data.features
            .map(f => f.properties)
            .filter(p => p.slug === selectedHikeSlug)}
        />
      ) : null}
    </div>
  );
}

export default App;

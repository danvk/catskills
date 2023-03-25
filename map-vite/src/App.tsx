import "./App.css";

import { useQuery } from "@tanstack/react-query";
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";

import { fetchJSON } from "./fetch";
import { Hike, HikeList } from "./HikeList";
import { HikeMap } from "./HikeMap";
import React from "react";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HikePage />}></Route>
    </Routes>
  );
}

function HikePage() {
  const hikeResource = useQuery({
    queryKey: ["log.json"],
    queryFn: fetchJSON<Hike[]>,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedHikeSlug = searchParams.get('hike');
  const handleSelectHike = React.useCallback((hike: string) => {
    setSearchParams({hike});
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
        selectedHikeSlug={selectedHikeSlug}
        onSelectHike={handleSelectHike}
      />
    </div>
  );
}

export default App;

import './App.css'

import {
  useQuery,
} from '@tanstack/react-query'
import { fetchJSON } from './fetch';
import { Hike, HikeList } from './HikeList';
import { HikeMap } from './HikeMap';
import React from 'react';

function App() {
  const hikeResource = useQuery({queryKey: ['log.json'], queryFn: fetchJSON<Hike[]>});

  const [selectedHikeSlug, setSelectedHikeSlug] = React.useState<string|null>(null);

  return (
    <div className="App">
      <HikeList hikes={hikeResource} selectedHikeSlug={selectedHikeSlug} onSelectHike={setSelectedHikeSlug} />
      <HikeMap hikes={hikeResource} selectedHikeSlug={selectedHikeSlug} onSelectHike={setSelectedHikeSlug} />
    </div>
  )
}

export default App

import './App.css'

import {
  useQuery,
} from '@tanstack/react-query'
import { fetchJSON } from './fetch';
import { Hike, HikeList } from './HikeList';
import { HikeMap } from './HikeMap';

function App() {
  const hikeResource = useQuery({queryKey: ['log.json'], queryFn: fetchJSON<Hike[]>});

  return (
    <div className="App">
      <HikeList hikes={hikeResource} />
      <HikeMap hikes={hikeResource} />
    </div>
  )
}

export default App

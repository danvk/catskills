import './App.css'

import {
  useQuery,
} from '@tanstack/react-query'
import { fetchJSON } from './fetch';
import { Hike, HikeList } from './HikeList';

function App() {
  const hikeResource = useQuery({queryKey: ['log.json'], queryFn: fetchJSON<Hike[]>});

  return (
    <div className="App">
      <HikeList hikes={hikeResource} />
      <div id='map'>Map</div>
    </div>
  )
}

export default App

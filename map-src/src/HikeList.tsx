import './HikeList.css';

import {UseQueryResult} from '@tanstack/react-query';
import classNames from 'classnames';

export interface Hike {
  title: string;
  url: string;
  slug: string;
  date: string;
  type: string;
  miles: string;
  hike_hours: string;
  peaks: string[];
  hikers: string[];
}

export interface Props {
  hikes: UseQueryResult<readonly Hike[]>;
  selectedHikeSlug: string | null;
  onSelectHike: (slug: string) => void;
}

export function HikeList(props: Props) {
  const {status, data, error} = props.hikes;

  return (
    <div id="hike-list">
      {status === 'loading' ? (
        'Loading…'
      ) : status === 'error' ? (
        String(error)
      ) : (
        <LoadedHikesList {...props} hikes={data} />
      )}
    </div>
  );
}

type HikeProps = Omit<Props, 'hikes'> & {
  hikes: readonly Hike[];
};

function LoadedHikesList(props: HikeProps) {
  return (
    <>
      {props.hikes.map(hike => (
        <HikeCard
          hike={hike}
          isSelected={hike.slug === props.selectedHikeSlug}
          key={hike.slug}
          onSelect={() => props.onSelectHike(hike.slug)}
        />
      ))}
    </>
  );
}

interface HikeCardProps {
  hike: Hike;
  isSelected: boolean;
  onSelect: () => void;
}

function HikeCard(props: HikeCardProps) {
  const {hike, isSelected, onSelect} = props;
  return (
    <div
      className={classNames('hike', isSelected && 'selected')}
      key={hike.slug}
      onClick={onSelect}>
      <span className="date">{hike.date}</span>{' '}
      <span className="stats">
        {hike.miles}mi {hike.type} / {hike.hike_hours}h
      </span>
      <h2>
        <a href={hike.url}>{hike.title}</a>
      </h2>
      {hike.peaks.map(peak => (
        <span className="peak" key={peak}>
          {peak}
        </span>
      ))}
      <br />
    </div>
  );
}

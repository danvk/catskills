import React from 'react';

interface Hike {
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
  hikes: readonly Hike[];
}

export function HikeList(props: Props) {

}

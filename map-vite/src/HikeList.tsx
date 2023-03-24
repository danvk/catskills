import { UseQueryResult } from "@tanstack/react-query";
import React from "react";

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
  hikes: UseQueryResult<readonly Hike[], unknown>;
}

export function HikeList(props: Props) {
  const { status, data, error } = props.hikes;

  return (
    <div id="hikes">
      {status === "loading" ? (
        "Loading…"
      ) : status === "error" ? (
        String(error)
      ) : (
        <LoadedHikesList hikes={data} />
      )}
    </div>
  );
}

interface HikeProps {
  hikes: readonly Hike[];
}

function LoadedHikesList(props: HikeProps) {
  return (
    <>
      {props.hikes.map((hike) => (
        <HikeCard hike={hike} key={hike.slug} />
      ))}
    </>
  );
}

function HikeCard(props: { hike: Hike }) {
  const { hike } = props;
  return (
    <div className="hike" key={hike.slug}>
      <span className="date">{hike.date}</span>
      <span className="stats">
        {hike.miles}mi {hike.type} / {hike.hike_hours}h
      </span>
      <h2>
        <a href="{hike.url}">{hike.title}</a>
      </h2>
      {hike.peaks.map((peak) => (
        <span className="peak" key={peak}>
          {peak}
        </span>
      ))}
      <br />
    </div>
  );
}

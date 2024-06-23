import _ from 'lodash';
import {MS_PER_HOUR} from './constants';

export function tuple<T extends unknown[]>(...args: T): T {
  return args;
}

export function rowRange(
  data: readonly [Date, ...unknown[]][],
  rangeMs: readonly [number, number],
): [number, number] {
  const dates = data.map(row => row[0]);
  const a = _.sortedIndexBy(dates, new Date(rangeMs[0]));
  const b = _.sortedIndex(dates, new Date(rangeMs[1]));
  return [a, b];
}

// See https://github.com/microsoft/TypeScript/issues/9356
function dateDiffMs(a: Date, b: Date): number {
  return a.valueOf() - b.valueOf();
}

/** Add a fourth column to the chart with trailing 30-min average mph */
export function addPace(rows: readonly [d: Date, eleFt: number, cumDMi: number][]) {
  let lagIdx = 0;
  const gapMs = 30 * 60 * 1_000;
  const outRows: [Date, number, number, number | null][] = [];
  for (const row of rows) {
    const [d, , cumD] = row;
    const d0 = rows[lagIdx][0];
    if (dateDiffMs(d, d0) < gapMs) {
      // not enough data for a baseline yet
      outRows.push([...row, null]);
      continue;
    }
    let newLagIdx = lagIdx;
    while (true) {
      newLagIdx++;
      const dLag = rows[newLagIdx][0];
      if (dateDiffMs(d, dLag) < gapMs) {
        break;
      }
      lagIdx = newLagIdx;
    }
    const deltaMs = dateDiffMs(d, rows[lagIdx][0]);
    const deltaMi = cumD - rows[lagIdx][2];
    const mph = (deltaMi / deltaMs) * MS_PER_HOUR;
    outRows.push([...row, mph]);
  }
  return outRows;
}

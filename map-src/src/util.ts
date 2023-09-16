import _ from 'lodash';

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

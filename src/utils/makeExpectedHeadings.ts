import type { Heading } from 'src/types';
import { trivial } from './getShownHeadings';

export function makeExpectedHeadings(
  headings: Heading[],
  max: number,
  mode: 'default' | 'concise' | 'disable'
): (index: number) => Heading[] {
  return (index: number) => {
    if (mode === 'disable') {
      return [];
    }
    const subHeadings = headings.slice(0, index);
    const result: Heading[] = [];
    trivial(subHeadings, result, mode);
    if (max) {
      return result.slice(-max);
    }
    return result;
  };
}

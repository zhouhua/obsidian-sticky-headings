import type { Heading } from 'src/types';

export function calcIndentLevels(headings: Heading[]): number[] {
  const result: number[] = [];
  if (!headings.length) {
    return result;
  }
  let currentIndentLevel = 0;
  headings.forEach((heading, i) => {
    if (i !== 0) {
      if (heading.level > headings[i - 1].level) {
        currentIndentLevel++;
      }
    }
    result.push(currentIndentLevel);
  });
  return result;
}

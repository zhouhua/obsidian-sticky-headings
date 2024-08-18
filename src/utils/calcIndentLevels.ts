import type { HeadingCache } from "obsidian";
import type { Heading } from "src/types";

function findLastFromindex<T = unknown>(
  list: T[],
  lastIndex: number,
  check: (item: T) => boolean
): number {
  let index = -1;
  for (let i = lastIndex; i >= 0; i--) {
    if (check(list[i])) {
      index = i;
      break;
    }
  }
  return index;
}

export function calcIndentLevels(
  headings: Heading[]
): number[] {
  const result: number[] = [];
  if (!headings.length) {
    return result;
  }
  const topLevelIndex = headings.reduce<number>(
    (res, cur, i) => cur.level < headings[res].level ? i : res,
    0
  );
  result.push(
    ...calcIndentLevels(headings.slice(0, topLevelIndex)).map(
      (level) => level + 1
    )
  );
  headings.slice(topLevelIndex).forEach((heading, i, list) => {
    if (i === 0) {
      result.push(0);
      return;
    }
    const parentIndex = findLastFromindex(
      list,
      i - 1,
      (item) => item.level < heading.level
    );
    if (parentIndex === -1) {
      result.push(0);
    } else {
      result.push(result[parentIndex + topLevelIndex] + 1);
    }
  });
  return result;
}

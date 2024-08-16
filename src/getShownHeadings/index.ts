import type { HeadingCache, MarkdownView } from 'obsidian';
import { getShownHeadingsPreview } from './preview';
import { getShownHeadingsSource } from './source';
import type { ISetting } from 'src/types';

function trivial(
  subHeadings: { heading: HeadingCache; offset: number; }[],
  result: { heading: HeadingCache; offset: number; }[],
  mode: 'default' | 'concise',
) {
  if (!subHeadings.length) {
    return result;
  }
  const topLevel = subHeadings.reduce(
    (res, cur) => Math.min(res, cur.heading.level),
    6,
  );
  const indexesOfTopLevel = subHeadings.reduce<number[]>((indexes, cur, index) => {
    if (cur.heading.level === topLevel) {
      indexes.push(index);
    }
    return indexes;
  }, []);
  if (mode === 'concise') {
    if (indexesOfTopLevel.length >= 1) {
      result.push(subHeadings[indexesOfTopLevel[indexesOfTopLevel.length - 1]]);
    }
  }
  else {
    for (const index of indexesOfTopLevel) {
      result.push(subHeadings[index]);
    }
  }
  trivial(
    subHeadings.slice(indexesOfTopLevel[indexesOfTopLevel.length - 1] + 1),
    result,
    mode,
  );
}

function getShownHeadings(
  headings: HeadingCache[],
  view: MarkdownView,
  stickyHeaderHeight: number,
  settings: ISetting,
): { heading: HeadingCache; offset: number; }[] {
  const { type } = view.currentMode;
  const getValidHeadings = type === 'preview' ? getShownHeadingsPreview : getShownHeadingsSource;
  const validHeadings = getValidHeadings(headings, view, stickyHeaderHeight);
  const finalHeadings: { heading: HeadingCache; offset: number; }[] = [];
  if (validHeadings.length) {
    trivial(validHeadings, finalHeadings, settings.mode);
  }
  if (settings.max) {
    return finalHeadings.slice(-settings.max);
  }
  return finalHeadings;
}

export default getShownHeadings;

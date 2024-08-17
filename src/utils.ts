import type { App, HeadingCache, TAbstractFile } from 'obsidian';
import { TFile, MarkdownView, MarkdownRenderer } from 'obsidian';

export function isMarkdownFile(file: TFile | TAbstractFile) {
  if (!(file instanceof TFile)) {
    return false;
  }
  return ['md', 'markdown'].includes(file.extension);
}

export function getHeadings(file: TFile, app: App) {
  return app.metadataCache.getFileCache(file)?.headings ?? [];
}

export function parseMarkdown(markdown: string, app: App): Promise<string> {
  const div = document.createElement('div');
  const activeView = app.workspace.getActiveViewOfType(MarkdownView);

  if (!activeView) {
    console.warn('No active markdown view is available.');
    return Promise.resolve(markdown); // Return the original markdown if rendering is not possible
  }

  return MarkdownRenderer.render(app, markdown, div, '', activeView).then(
    () => {
      return div.innerText;
    }
  );
}

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
  headings: { heading: HeadingCache; offset: number }[]
): number[] {
  const result: number[] = [];
  if (!headings.length) {
    return result;
  }
  const topLevelIndex = headings.reduce<number>(
    (res, cur, i) =>
      cur.heading.level < headings[res].heading.level ? i : res,
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
      (item) => item.heading.level < heading.heading.level
    );
    if (parentIndex === -1) {
      result.push(0);
    } else {
      result.push(result[parentIndex + topLevelIndex] + 1);
    }
  });
  return result;
}

export function trivial(
  subHeadings: { heading: HeadingCache; offset: number }[],
  result: { heading: HeadingCache; offset: number }[],
  mode: 'default' | 'concise'
) {
  if (!subHeadings.length) {
    return result;
  }
  const topLevel = subHeadings.reduce(
    (res, cur) => Math.min(res, cur.heading.level),
    6
  );
  const indexesOfTopLevel = subHeadings.reduce<number[]>(
    (indexes, cur, index) => {
      if (cur.heading.level === topLevel) {
        indexes.push(index);
      }
      return indexes;
    },
    []
  );
  if (mode === 'concise') {
    if (indexesOfTopLevel.length >= 1) {
      result.push(subHeadings[indexesOfTopLevel[indexesOfTopLevel.length - 1]]);
    }
  } else {
    for (const index of indexesOfTopLevel) {
      result.push(subHeadings[index]);
    }
  }
  trivial(
    subHeadings.slice(indexesOfTopLevel[indexesOfTopLevel.length - 1] + 1),
    result,
    mode
  );
}

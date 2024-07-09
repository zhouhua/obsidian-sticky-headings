import type { App, HeadingCache, TAbstractFile } from 'obsidian';
import { TFile } from 'obsidian';

export function isMarkdownFile(file: TFile | TAbstractFile) {
  if (!(file instanceof TFile)) {
    return false;
  }
  return ['md', 'markdown'].includes(file.extension);
}

export function getHeadings(file: TFile, app: App) {
  return app.metadataCache.getFileCache(file)?.headings ?? [];
}

export function trivial(
  subHeadings: HeadingCache[],
  result: HeadingCache[],
  mode: 'default' | 'concise',
) {
  if (!subHeadings.length) {
    return result;
  }
  const topLevel = subHeadings.reduce(
    (res, cur) => Math.min(res, cur.level),
    6,
  );
  const indexesOfTopLevel = subHeadings.reduce<number[]>((indexes, cur, index) => {
    if (cur.level === topLevel) {
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

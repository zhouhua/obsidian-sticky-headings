import type { HeadingCache, MarkdownView } from 'obsidian';
import type { Heading, ISetting } from 'src/types';
import { getBoundaryOffset, isEditMode } from './obsidian';

const isHeadingRegex = /^<h[1-6]/i;

export function getHeadingsWithOffsetPreview(
  headings: HeadingCache[],
  view: MarkdownView,
  settings: ISetting
): Heading[] {
  const headingsOffset: number[] = [];
  const boundaryOffset = getBoundaryOffset(view, settings);
  let heightSum = 0;
  // @ts-expect-error height not defined in obsidian typing
  view.previewMode.renderer.sections.forEach(({ html, height = 0 }) => {
    if (isHeadingRegex.test(html)) {
      headingsOffset.push(heightSum);
    }
    heightSum += height;
  });
  return headings.map<Heading>((heading, index) => ({
    ...heading,
    offset: (headingsOffset[index] || 0) - boundaryOffset,
    indentLevel: heading.level - 1,
    title: heading.heading,
    index,
  }));
}

export function getHeadingsWithOffsetSource(
  headings: HeadingCache[],
  view: MarkdownView,
  settings: ISetting
): Heading[] {
  const result = headings.map<Heading>((heading, i) => {
    const { position } = heading;
    const offset = view.editMode.containerEl.querySelector<HTMLElement>('.cm-contentContainer')?.offsetTop || 0;
    const boundaryOffset = getBoundaryOffset(view, settings);
    const { top = 0 } = view.editor.cm.lineBlockAt(position.start.offset);
    return {
      ...heading,
      offset: top + offset - boundaryOffset,
      indentLevel: heading.level - 1,
      title: heading.heading,
      index: i,
    };
  });
  return result;
}

export function trivial(subHeadings: Heading[], result: Heading[], mode: 'default' | 'concise' | 'disable') {
  if (!subHeadings.length || mode === 'disable') {
    return result;
  }
  const topLevel = subHeadings.reduce((res, cur) => Math.min(res, cur.level), 6);
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
  } else {
    for (const index of indexesOfTopLevel) {
      result.push(subHeadings[index]);
    }
  }
  trivial(subHeadings.slice(indexesOfTopLevel[indexesOfTopLevel.length - 1] + 1), result, mode);
}
export function getHeadingsWithOffset(headings: HeadingCache[], view: MarkdownView, settings: ISetting): Heading[] {
  const getValidHeadings = isEditMode(view) ? getHeadingsWithOffsetSource : getHeadingsWithOffsetPreview;
  const validHeadings = getValidHeadings(headings, view, settings);
  return validHeadings;
}

export default getHeadingsWithOffset;

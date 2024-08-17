import type { HeadingCache, MarkdownView } from 'obsidian';

const isHeading = /^<h[1-6]/i;

export function getShownHeadingsPreview(
  headings: HeadingCache[],
  view: MarkdownView,
  stickyHeaderHeight: number,
): { heading: HeadingCache; offset: number; }[] {
  const headingsOffset: number[] = [];
  let heightSum = 0;
  // @ts-expect-error height not defined in obsidian typing
  view.previewMode.renderer.sections.forEach(({ html, height = 0 }) => {
    if (isHeading.test(html)) {
      headingsOffset.push(heightSum);
    }
    heightSum += height;
  });
  const { scrollTop } = view.previewMode.renderer.previewEl;
  const result: { heading: HeadingCache; offset: number; }[] = [];
  for (let index = 0; index < headings.length; index++) {
    const top = headingsOffset[index] || 0;
    if (top - stickyHeaderHeight > scrollTop) {
      break;
    }
    else {
      result.push({
        heading: headings[index],
        offset: top,
      });
    }
  }
  return result;
}

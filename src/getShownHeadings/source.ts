import type { HeadingCache, MarkdownView } from 'obsidian';

export function getShownHeadingsSource(
  headings: HeadingCache[],
  view: MarkdownView,
  stickyHeaderHeight: number,
): { heading: HeadingCache; offset: number; }[] {
  const scrollTop = view.editor.getScrollInfo().top;
  const result: { heading: HeadingCache; offset: number; }[] = [];
  for (const heading of headings) {
    const { position } = heading;
    // const { top = 0 } = view.editMode.editor?.coordsAtPos({ line: position.start.line, ch: 0 }, true) || {};
    const offset = view.editMode.containerEl.querySelector<HTMLElement>('.cm-contentContainer')?.offsetTop || 0;
    const { top = 0 } = view.editor.cm.lineBlockAt(position.start.offset);
    if (top - stickyHeaderHeight + offset > scrollTop) {
      break;
    }
    else {
      result.push({
        heading,
        offset: top + offset,
      });
    }
  }
  return result;
}

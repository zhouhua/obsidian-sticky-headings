import StickyHeader from './ui/StickyHeader.svelte';
import type { MarkdownView } from 'obsidian';
import type { Heading } from './types';

export default class StickyHeaderComponent {
  stickyHeaderComponent!: StickyHeader;

  constructor(view: MarkdownView) {
    this.addStickyHeader(view);
  }

  addStickyHeader(view: MarkdownView) {
    const { contentEl } = view;
    this.stickyHeaderComponent = new StickyHeader({
      target: contentEl,
      props: {
        headings: [],
        editMode: false,
        view,
        getExpectedHeadings: () => [],
      },
    });
  }

  removeStickyHeader() {
    this.stickyHeaderComponent.$destroy();
  }

  updateHeadings(headings: Heading[], getExpectedHeadings: (index: number) => Heading[]) {
    this.stickyHeaderComponent.$set({ headings, getExpectedHeadings });
  }

  updateEditMode(editMode: boolean) {
    this.stickyHeaderComponent.$set({ editMode });
  }
}

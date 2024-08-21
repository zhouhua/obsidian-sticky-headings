import StickyHeader from './ui/StickyHeader.svelte';
import type { MarkdownView } from 'obsidian';
import type { Heading, ISetting } from './types';

export default class StickyHeaderComponent {
  stickyHeaderComponent!: StickyHeader;

  constructor(view: MarkdownView, settings: ISetting) {
    this.addStickyHeader(view, settings);
  }

  addStickyHeader(view: MarkdownView, settings: ISetting) {
    const { contentEl } = view;
    this.stickyHeaderComponent = new StickyHeader({
      target: contentEl,
      props: {
        headings: [],
        editMode: false,
        view,
        getExpectedHeadings: () => [],
        settings,
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

  updateSettings(settings: ISetting) {
    this.stickyHeaderComponent.$set({ settings });
  }
}

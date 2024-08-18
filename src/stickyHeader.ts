import StickyHeader from './ui/StickyHeader.svelte';
import { MarkdownView } from 'obsidian';
import type { Heading } from './types';

export default class StickyHeaderComponent {
  stickyHeaderComponent!: StickyHeader;

  constructor(view: MarkdownView) {
    this.addStickyHeader(view);
  }

  addStickyHeader(view: MarkdownView) {
    const { contentEl } = view;
    if (contentEl) {
      this.stickyHeaderComponent = new StickyHeader({
        target: contentEl,
        props: {
          headings: [],
          editMode: false,
          indentList: [],
          view,
        },
      });
    }
  }

  removeStickyHeader() {
    if (this.stickyHeaderComponent) {
      this.stickyHeaderComponent?.$destroy();
    }
  }

  updateHeadings(headings: Heading[]) {
    if (this.stickyHeaderComponent) {
      this.stickyHeaderComponent.$set({ headings });
    }
  }

  updateEditMode(editMode: boolean) {
    if (this.stickyHeaderComponent) {
      this.stickyHeaderComponent.$set({ editMode });
    }
  }

  updateIndentList(indentList: number[]) {
    if (this.stickyHeaderComponent) {
      this.stickyHeaderComponent.$set({ indentList });
    }
  }
}

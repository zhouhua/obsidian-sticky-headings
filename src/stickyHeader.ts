import { editMode } from './ui/store';
import StickyHeader from './ui/StickyHeader.svelte';
import { ItemView } from 'obsidian';
import type { Heading } from './plugin';

export default class StickyHeaderComponent {
  stickyHeaderComponent!: StickyHeader;

  constructor(view: ItemView) {
    this.addStickyHeader(view);
  }

  addStickyHeader(view: ItemView) {
    const { contentEl } = view;
    if (contentEl) {
      this.stickyHeaderComponent = new StickyHeader({
        target: contentEl,
        props: {
          icons: true,
          headings: [],
          editMode: false,
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
}

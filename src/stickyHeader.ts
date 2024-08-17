import StickyHeader from './ui/StickyHeader.svelte';
import { ItemView } from 'obsidian';

import { headings, editMode } from './ui/store';

export default class StickyHeaderComponent {
  stickyHeaderComponent: StickyHeader | null = null;

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
        },
      });
    }
  }

  removeStickyHeader() {
    if (this.stickyHeaderComponent) {
      this.stickyHeaderComponent?.$destroy();
      this.stickyHeaderComponent = null;
    }
  }
}

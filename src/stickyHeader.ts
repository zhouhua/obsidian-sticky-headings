import StickyHeader from './components/StickyHeader.svelte';
import {
  MarkdownView,
  Plugin,
  PluginSettingTab,
  setIcon,
  Setting,
  ItemView,
  View,
} from 'obsidian';

import { headings, editMode } from './components/store';

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
      headings.set(['heading 1', 'next heading', 'heading 3']);
    }
  }

  removeStickyHeader() {
    if (this.stickyHeaderComponent) {
      this.stickyHeaderComponent?.$destroy();
      this.stickyHeaderComponent = null;
    }
  }
}

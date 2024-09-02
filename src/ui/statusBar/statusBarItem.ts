import StatusBarItem from './StatusBarItem.svelte';
import type { MarkdownView, TFile } from 'obsidian';
import type { Heading, ISetting } from '../../types';

export default class StickyHeaderComponent {
  statusBarItemComponent!: StatusBarItem;

  constructor(statusItemEl: HTMLElement, settings: ISetting, view?: MarkdownView) {
    this.addStatusBarItem(statusItemEl, settings, view);
  }

  addStatusBarItem(statusItemEl: HTMLElement, settings: ISetting, view?: MarkdownView) {
    this.statusBarItemComponent = new StatusBarItem({
      target: statusItemEl,
      props: {
        view,
        heading: undefined,
        file: undefined,
      },
    });
  }

  removeStickyHeader() {
    this.statusBarItemComponent.$destroy();
  }

  switchFile(file: TFile, heading: Heading, view: MarkdownView) {
    this.statusBarItemComponent.$set({ file, heading, view });
  }

  updateHeading(heading?: Heading) {
    this.statusBarItemComponent.$set({ heading });
  }

  hide() {
    this.statusBarItemComponent.$set({
      file: undefined,
    });
  }
}

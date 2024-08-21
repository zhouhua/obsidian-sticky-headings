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
        headings: [],
        view,
        settings,
        heading: undefined,
        file: undefined,
      },
    });
  }

  removeStickyHeader() {
    this.statusBarItemComponent.$destroy();
  }

  switchFile(file: TFile, headings: Heading[], heading: Heading, view: MarkdownView) {
    this.statusBarItemComponent.$set({ file, headings, heading, view });
  }

  updateSettings(settings: ISetting) {
    this.statusBarItemComponent.$set({ settings });
  }

  updateHeading(headings: Heading[], heading?: Heading) {
    this.statusBarItemComponent.$set({ heading, headings });
  }

  hide() {
    this.statusBarItemComponent.$set({
      file: undefined,
    });
  }
}

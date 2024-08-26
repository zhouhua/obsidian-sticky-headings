import StickyHeader from './ui/StickyHeader.svelte';
import type { MarkdownView } from 'obsidian';
import type { Heading, ISetting } from './types';

export default class StickyHeaderComponent {
  stickyHeaderComponents!: [StickyHeader, StickyHeader];

  constructor(view: MarkdownView, settings: ISetting) {
    this.addStickyHeader(view, settings);
  }

  addStickyHeader(view: MarkdownView, settings: ISetting) {
    const previewContentEl = view.previewMode.containerEl;
    const sourceContentEl = view.editMode.editorEl;
    this.stickyHeaderComponents = [
      new StickyHeader({
        target: previewContentEl,
        props: {
          headings: [],
          editMode: false,
          view,
          getExpectedHeadings: () => [],
          settings,
          showFileName: false,
        },
      }),
      new StickyHeader({
        target: sourceContentEl,
        props: {
          headings: [],
          editMode: false,
          view,
          getExpectedHeadings: () => [],
          settings,
          showFileName: false,
        },
      }),
    ];
  }

  removeStickyHeader() {
    this.stickyHeaderComponents.forEach(conponent => conponent.$destroy());
  }

  updateHeadings(
    headings: Heading[],
    getExpectedHeadings: (index: number) => Heading[],
    showFileName: boolean,
    view: MarkdownView
  ) {
    this.stickyHeaderComponents.forEach(conponent =>
      conponent.$set({ headings, getExpectedHeadings, showFileName, view })
    );
  }

  updateEditMode(editMode: boolean) {
    this.stickyHeaderComponents.forEach(conponent => conponent.$set({ editMode }));
  }

  updateSettings(settings: ISetting) {
    this.stickyHeaderComponents.forEach(conponent => conponent.$set({ settings }));
  }
}

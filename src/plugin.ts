import debounce from 'lodash/debounce';
import type { EventRef, HeadingCache, Pos, TFile } from 'obsidian';
import { MarkdownView, Plugin, ItemView } from 'obsidian';
import type { ISetting } from './typing';
import StickyHeadingsSetting, { defaultSettings } from './settings';
import {
  calcIndentLevels,
  getHeadings,
  isMarkdownFile,
  parseMarkdown,
  trivial,
} from './utils';

import StickyHeaderComponent from './stickyHeader';
import { stickyHeadings, editMode } from './ui/store';

export interface Heading {
  heading: string;
  title: string;
  level: number;
  position: Pos;
  offset: any;
}

export default class StickyHeadingsPlugin extends Plugin {
  settings: ISetting = defaultSettings;
  headingEl: StickyHeaderComponent | undefined;
  fileResolveMap: Map<
    string,
    {
      resolve: boolean;
      file: TFile;
      view: MarkdownView;
      container: HTMLElement;
      headings: Heading[];
      headingEl: StickyHeaderComponent | undefined;
      layoutChangeEvent: EventRef;
      scrollListener?: ((event: Event) => void) | null;
    }
  > = new Map();

  markdownCache: Record<string, string> = {};

  detectPosition = debounce(
    (event: Event, scroller, headings: Heading[]) => {
      const target = event.target as HTMLElement | null;
      if (scroller) {
        const container = target?.closest('.view-content');
        if (container) {
          this.setHeadingsInView(scroller.scrollTop, headings);
        }
      }
    },
    20,
    { leading: true, trailing: true }
  );

  setHeadingsInView(scrollTop: number, headings: Heading[]) {
    const headingsInView = headings.filter(
      (heading) => heading.offset.top < scrollTop
    );
    stickyHeadings.set(headingsInView);
  }

  async onload() {
    await this.loadSettings();

    this.registerEvent(
      this.app.workspace.on('file-open', () => {
        this.checkFileResolveMap();
      })
    );

    this.registerEvent(
      this.app.workspace.on('editor-change', (editor, info) => {
        this.handleEditorChange(info.file);
      })
    );

    this.registerEvent(
      this.app.metadataCache.on('resolve', (file) => this.handleResolve(file))
    );

    this.checkFileResolveMap();

    this.addSettingTab(new StickyHeadingsSetting(this.app, this));
  }

  async createStickyHeaderComponent() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      const id = view.leaf.id;
      if (id && !this.fileResolveMap.has(id)) {
        const file = view.getFile();
        if (file && isMarkdownFile(file)) {
          const headings = await this.retrieveHeadings(file, view);
          // console.log('🚀 ~ headings:', headings);
          const headingEl = new StickyHeaderComponent(view as ItemView);

          const layoutChangeEvent = this.app.workspace.on(
            'layout-change',
            this.handleLayoutChange.bind(this, view, headings)
          );

          this.fileResolveMap.set(id, {
            resolve: true,
            file,
            container: view.contentEl,
            view,
            headings,
            headingEl,
            layoutChangeEvent,
          });

          this.registerEvent(layoutChangeEvent);

          this.checkFileResolveMap();
        }
      }
    }
  }

  handleLayoutChange(view: MarkdownView, headings: Heading[]) {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      editMode.set(activeView.editMode.sourceMode);

      const { type } = view.currentMode;
      const scroller =
        type === 'source'
          ? view.editor.cm.scrollDOM
          : view.previewMode.renderer.previewEl;

      const id = view.leaf.id;
      if (id) {
        const item = this.fileResolveMap.get(id);
        if (item) {
          // Remove existing scroll listener if it exists
          if (item.scrollListener && item.view?.contentEl) {
            item.view.contentEl.removeEventListener(
              'scroll',
              item.scrollListener,
              true
            );
          }

          if (scroller) {
            this.setHeadingsInView(scroller?.scrollTop, headings);
            // Create new scroll listener
            const newScrollListener = (event: Event) =>
              this.detectPosition(event, scroller, headings);
            view.contentEl.addEventListener('scroll', newScrollListener, true);

            // Update the fileResolveMap with the new scroll listener
            item.scrollListener = newScrollListener;
            this.fileResolveMap.set(id, item);
          } else {
            // If there's no scroller, ensure we remove any existing listener
            item.scrollListener = null;
            this.fileResolveMap.set(id, item);
          }
        }
      }
    }
  }

  handleEditorChange(file: TFile | null) {
    if (file && isMarkdownFile(file)) {
      this.fileResolveMap.forEach((item) => {
        if (item.file.path === file.path) {
          item.resolve = false;
        }
      });
    }
  }

  handleResolve(file: TFile) {
    if (isMarkdownFile(file)) {
      const ids: string[] = [];
      this.fileResolveMap.forEach((item, id) => {
        if (item.file.path === file.path && !item.resolve) {
          item.resolve = true;
          ids.push(id);
        }
      });
      if (ids.length > 0) {
        this.checkFileResolveMap();
      }
    }
  }

  checkFileResolveMap() {
    const validIds = new Set<string>();
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        console.log('🚀 ~ leaf:', leaf);
        const id = leaf.id;
        if (id) {
          validIds.add(id);
          if (!this.fileResolveMap.has(id)) {
            this.createStickyHeaderComponent();
          }
        }
      }
    });

    this.fileResolveMap.forEach((_, id) => {
      if (!validIds.has(id)) {
        console.log('deleting');
        const item = this.fileResolveMap.get(id);
        item?.headingEl?.removeStickyHeader();
        this.fileResolveMap.delete(id);
      }
    });
  }

  async retrieveHeadings(file: TFile, view: MarkdownView): Promise<Heading[]> {
    const headings = getHeadings(file, this.app);

    if (!headings) return;

    return await Promise.all(
      headings.map(async (heading) => ({
        ...heading,
        title: await parseMarkdown(heading.heading, this.app),
        offset: view.editor.cm.lineBlockAt(heading.position.start.offset),
      }))
    );
  }

  onunload() {
    this.fileResolveMap.forEach((item, id) => {
      item.headingEl?.removeStickyHeader();

      if (item.layoutChangeEvent) {
        this.app.workspace.offref(item.layoutChangeEvent);
      }

      if (item.scrollListener && item.view?.contentEl) {
        item.view.contentEl.removeEventListener(
          'scroll',
          item.scrollListener,
          true
        );
      }
    });

    this.fileResolveMap.clear();
  }

  async loadSettings() {
    this.settings = {
      ...defaultSettings,
      ...((await this.loadData()) as ISetting),
    };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

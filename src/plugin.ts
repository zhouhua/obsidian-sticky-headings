import type { TFile } from 'obsidian';
import { MarkdownView, Plugin } from 'obsidian';
import type { FileResolveEntry, Heading, ISetting } from './types';
import StickyHeadingsSetting, { defaultSettings } from './settings';
import { getHeadings, getScroller, isEditSourceMode, isMarkdownFile, parseMarkdown } from './utils/obsidian';

import StickyHeaderComponent from './stickyHeader';
import getShownHeadings, { trivial } from './utils/getShownHeadings';
import { throttle } from 'lodash';

type FileResolveMap = Map<string, FileResolveEntry>;

export default class StickyHeadingsPlugin extends Plugin {
  settings: ISetting = defaultSettings;
  headingEl: StickyHeaderComponent | undefined;
  fileResolveMap: FileResolveMap = new Map();

  markdownCache: Record<string, string> = {};

  async onload() {
    await this.loadSettings();

    this.registerEvent(
      this.app.workspace.on('file-open', () => {
        // timeout to wait for cm.editor to load
        setTimeout(() => {
          this.checkFileResolveMap();
        }, 100);
      })
    );

    this.registerEvent(this.app.metadataCache.on('resolve', file => this.handleResolve(file)));

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
          const headingEl = new StickyHeaderComponent(view);

          const layoutChangeEvent = this.app.workspace.on('layout-change', this.handleComponentUpdate.bind(this));

          this.fileResolveMap.set(id, {
            resolve: true,
            file,
            container: view.contentEl,
            view,
            headings,
            headingEl,
            layoutChangeEvent,
            editMode: isEditSourceMode(view),
          });

          this.registerEvent(layoutChangeEvent);

          await this.handleComponentUpdate();
        }
      }
    }
  }

  async updateHeadings(file: TFile, view: MarkdownView, item: FileResolveEntry) {
    this.setHeadingsInView(getScroller(view), item);
    item.headingEl.updateHeadings(item.headings);
    return item.headings;
  }

  async handleComponentUpdate() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      const scroller = getScroller(view);
      console.log(scroller);
      const id = view.leaf.id;
      if (id) {
        const item = this.fileResolveMap.get(id);
        if (item) {
          // Remove existing scroll listener if it exists
          if (item.scrollListener && item.view?.contentEl) {
            item.view.contentEl.removeEventListener('scroll', item.scrollListener, true);
          }

          item.editMode = isEditSourceMode(item.view);
          item.headingEl.updateEditMode(isEditSourceMode(item.view));

          if (scroller) {
            this.setHeadingsInView(scroller, item);
            // Create new scroll listener
            const newScrollListener = (event: Event) => this.detectPosition(event, scroller, item);
            item.view.contentEl.addEventListener('scroll', newScrollListener, true);

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

  detectPosition = throttle(
    (event: Event, scroller: HTMLElement, item: FileResolveEntry) => {
      const target = event.target as HTMLElement | null;
      if (scroller) {
        const container = target?.closest('.view-content');
        if (container) {
          this.setHeadingsInView(scroller, item);
        }
      }
    },
    50,
    { leading: true, trailing: true }
  );

  async setHeadingsInView(scroller: HTMLElement, item: FileResolveEntry) {
    const scrollTop = scroller.scrollTop;
    // fixme: Use a more appropriate method to get the component height.
    const stuckHeaderHeight =
      scroller.closest('.view-content')?.querySelector<HTMLElement>('.sticky-headings-root')?.clientHeight || 0;
    if (item) {
      const headings = await this.retrieveHeadings(item.file, item.view);
      item.headings = headings;
      const headingsInView = headings.filter(heading => heading.offset < scrollTop + stuckHeaderHeight);
      let findalHeadings: Heading[] = [];
      trivial(headingsInView, findalHeadings, this.settings.mode);
      if (this.settings.max) {
        findalHeadings = findalHeadings.slice(-this.settings.max);
      }

      // Simple indentation calculation
      if (findalHeadings.length === 0) {
        return [];
      }

      const result: Heading[] = [];
      let currentLevel = 6; // Start with the highest possible level

      for (let i = findalHeadings.length - 1; i >= 0; i--) {
        const heading = findalHeadings[i];

        if (heading.level < currentLevel) {
          result.unshift(heading);
          currentLevel = heading.level;
        }

        // Break if we've reached the highest level
        if (currentLevel === 1) break;
      }

      item.headingEl.updateHeadings(findalHeadings);
    }
  }

  handleEditorChange(file: TFile | null) {
    if (file && isMarkdownFile(file)) {
      this.fileResolveMap.forEach(item => {
        if (item.file.path === file.path) {
          item.resolve = false;
        }
      });
    }
  }

  handleResolve(file: TFile) {
    if (isMarkdownFile(file)) {
      const ids: string[] = [];
      this.fileResolveMap.forEach(async (item, id) => {
        if (item.file.path === file.path) {
          await this.updateHeadings(file, item.view, item);
          if (!item.resolve) {
            item.resolve = true;
            ids.push(id);
          }
        }
      });
      if (ids.length > 0) {
        this.checkFileResolveMap();
      }
    }
  }

  checkFileResolveMap() {
    const validIds = new Set<string>();
    this.app.workspace.iterateAllLeaves(async leaf => {
      if (leaf.view instanceof MarkdownView) {
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
    console.log('🚀 ~ view:', view);
    const headings = getHeadings(file, this.app);

    if (!headings || headings.length === 0) return [];

    return await Promise.all(
      getShownHeadings(headings, view).map(async ({ heading, offset }) => ({
        ...heading,
        title: await parseMarkdown(heading.heading, this.app),
        offset,
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
        item.view.contentEl.removeEventListener('scroll', item.scrollListener, true);
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

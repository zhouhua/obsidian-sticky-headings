/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { TFile } from 'obsidian';
import { MarkdownView, Plugin } from 'obsidian';
import type { FileResolveEntry, Heading, ISetting } from './types';
import StickyHeadingsSetting, { defaultSettings } from './settings';
import {
  getContainerEl,
  getHeadings,
  getScroller,
  isEditSourceMode,
  isMarkdownFile,
  needShowFileName,
  parseMarkdown,
} from './utils/obsidian';

import StickyHeaderComponent from './stickyHeader';
import getShownHeadings, { trivial } from './utils/getShownHeadings';
import { throttle } from 'lodash';
import { calcIndentLevels } from './utils/calcIndentLevels';
import { makeExpectedHeadings } from './utils/makeExpectedHeadings';

type FileResolveMap = Map<string, FileResolveEntry>;

export default class StickyHeadingsPlugin extends Plugin {
  settings: ISetting = defaultSettings;
  headingEl: StickyHeaderComponent | undefined;
  fileResolveMap: FileResolveMap = new Map();

  markdownCache: Record<string, string> = {};

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

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onload() {
    await this.loadSettings();

    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        // timeout to wait for cm.editor to load
        setTimeout(() => {
          this.checkFileResolveMap();
        }, 100);
      })
    );

    this.registerEvent(
      this.app.metadataCache.on('resolve', file => {
        this.handleResolve(file);
      })
    );

    this.checkFileResolveMap();

    this.addSettingTab(new StickyHeadingsSetting(this.app, this));
  }

  async initStickyHeaderComponent() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      const { id } = view.leaf;
      if (id) {
        const file = view.getFile();
        if (file && isMarkdownFile(file)) {
          const headings = await this.retrieveHeadings(file, view);
          if (!this.fileResolveMap.has(id)) {
            const headingEl = new StickyHeaderComponent(view, this.settings);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
          } else {
            const item = this.fileResolveMap.get(id);
            if (item) {
              item.editMode = isEditSourceMode(view);
              item.headings = headings;
              item.file = file;
            }
          }
          await this.handleComponentUpdate();
        }
      }
    }
  }

  async updateHeadings(file: TFile, view: MarkdownView, item: FileResolveEntry) {
    await this.setHeadingsInView(getScroller(view), item);
    // item.headingEl.updateHeadings(item.headings);
    return item.headings;
  }

  async handleComponentUpdate() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      const scroller = getScroller(view);
      const { id } = view.leaf;
      if (id) {
        const item = this.fileResolveMap.get(id);
        if (item) {
          // Remove existing scroll listener if it exists
          if (item.scrollListener && item.view.contentEl) {
            item.view.contentEl.removeEventListener('scroll', item.scrollListener, true);
          }

          item.editMode = isEditSourceMode(item.view);
          item.headingEl.updateEditMode(isEditSourceMode(item.view));

          if (scroller) {
            await this.setHeadingsInView(scroller, item);
            // Create new scroll listener
            const newScrollListener = (event: Event) => {
              this.detectPosition(event, scroller, item);
            };
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

  async setHeadingsInView(scroller: HTMLElement, item: FileResolveEntry) {
    const { scrollTop } = scroller;
    const stuckHeaderHeight = getContainerEl(scroller)?.clientHeight || 0;
    if (item) {
      const headings = await this.retrieveHeadings(item.file, item.view);
      item.headings = headings;
      const headingsInView = headings.filter(heading => heading.offset < scrollTop + stuckHeaderHeight);
      let findalHeadings: Heading[] = [];
      trivial(headingsInView, findalHeadings, this.settings.mode);
      if (this.settings.max) {
        findalHeadings = findalHeadings.slice(-this.settings.max);
      }
      const indentList = calcIndentLevels(findalHeadings);
      item.headingEl.updateHeadings(
        findalHeadings.map((heading, i) => ({
          ...heading,
          indentLevel: indentList[i] || 0,
        })),
        makeExpectedHeadings(headings, this.settings.max, this.settings.mode),
        this.settings.autoShowFileName && needShowFileName(item.file, this.app),
        item.view
      );
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

  async handleResolve(file: TFile) {
    if (isMarkdownFile(file)) {
      const ids: string[] = [];
      for (const [id, item] of this.fileResolveMap) {
        if (item.file.path === file.path) {
          await this.updateHeadings(file, item.view, item);
          if (!item.resolve) {
            item.resolve = true;
            ids.push(id);
          }
        }
      }
      if (ids.length > 0) {
        this.checkFileResolveMap();
      }
    }
  }

  checkFileResolveMap() {
    const validIds = new Set<string>();
    this.app.workspace.iterateAllLeaves(leaf => {
      if (leaf.view instanceof MarkdownView) {
        const { id } = leaf;
        if (id) {
          validIds.add(id);
          this.initStickyHeaderComponent();
        }
      }
    });

    this.fileResolveMap.forEach((_, id) => {
      if (!validIds.has(id)) {
        // debug: console.log('deleting');
        const item = this.fileResolveMap.get(id);
        item?.headingEl.removeStickyHeader();
        this.fileResolveMap.delete(id);
      }
    });
  }

  async retrieveHeadings(file: TFile, view: MarkdownView): Promise<Heading[]> {
    const headings = getHeadings(file, this.app);

    if (!headings || headings.length === 0) return [];

    return await Promise.all(
      getShownHeadings(headings, view).map(async heading => {
        const cacheKey = heading.heading;
        let title: string;
        if (cacheKey in this.markdownCache) {
          // console.log('skipping because its cached');
          title = this.markdownCache[cacheKey];
        } else {
          title = await parseMarkdown(heading.heading, this.app);
          // console.log('adding to cache');
          this.markdownCache[cacheKey] = title;
        }
        return {
          ...heading,
          title,
        };
      })
    );
  }

  onSettingChanged() {
    this.fileResolveMap.forEach(item => {
      if (item.headingEl) {
        item.headingEl.updateSettings(this.settings);
      }
    });
  }

  onunload() {
    this.fileResolveMap.forEach((item, id) => {
      item.headingEl.removeStickyHeader();

      if (item.layoutChangeEvent) {
        this.app.workspace.offref(item.layoutChangeEvent);
      }

      if (item.scrollListener && item.view.contentEl) {
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
